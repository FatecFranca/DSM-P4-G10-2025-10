import data from "../models/data.js";

class AnalyticsController {
    
    // 1. Análise de Tendências de Consumo por Dia da Semana
    static async getConsumptionByDay(req, res, next) {
        try {
            const { startDate, endDate, device_name } = req.query;
            
            let matchStage = {};
            if (startDate && endDate) {
                matchStage.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (device_name) {
                matchStage.device_name = { $regex: device_name, $options: 'i' };
            }

            const dailyConsumption = await data.aggregate([
                { $match: matchStage },
                {
                    $addFields: {
                        dayOfWeek: { $dayOfWeek: "$date" },
                        dayName: {
                            $switch: {
                                branches: [
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 1] }, then: "Domingo" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 2] }, then: "Segunda" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 3] }, then: "Terça" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 4] }, then: "Quarta" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 5] }, then: "Quinta" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 6] }, then: "Sexta" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 7] }, then: "Sábado" }
                                ],
                                default: "Desconhecido"
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            dayOfWeek: "$dayOfWeek",
                            dayName: "$dayName"
                        },
                        avgConsumption: { $avg: "$consumption" },
                        totalConsumption: { $sum: "$consumption" },
                        count: { $sum: 1 },
                        maxConsumption: { $max: "$consumption" },
                        minConsumption: { $min: "$consumption" }
                    }
                },
                { $sort: { "_id.dayOfWeek": 1 } },
                {
                    $project: {
                        dayOfWeek: "$_id.dayOfWeek",
                        dayName: "$_id.dayName",
                        avgConsumption: { $round: ["$avgConsumption", 2] },
                        totalConsumption: { $round: ["$totalConsumption", 2] },
                        count: 1,
                        maxConsumption: { $round: ["$maxConsumption", 2] },
                        minConsumption: { $round: ["$minConsumption", 2] },
                        _id: 0
                    }
                }
            ]);

            res.status(200).json({
                analysis: "Consumo Diário por Dia da Semana",
                data: dailyConsumption,
                insights: {
                    peakDay: dailyConsumption.length > 0 ? dailyConsumption.reduce((max, curr) => 
                        curr.avgConsumption > max.avgConsumption ? curr : max
                    ) : null,
                    lowDay: dailyConsumption.length > 0 ? dailyConsumption.reduce((min, curr) => 
                        curr.avgConsumption < min.avgConsumption ? curr : min
                    ) : null
                }
            });
        } catch (erro) {
            console.error("Erro em getConsumptionByDay:", erro);
            next(erro);
        }
    }
    // 2. Análise de Eficiência Energética por Temperatura
    static async getEnergyEfficiency(req, res, next) {
        try {
            const { startDate, endDate, device_name } = req.query;
            
            let matchStage = {};
            if (startDate && endDate) {
                matchStage.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (device_name) {
                matchStage.device_name = { $regex: device_name, $options: 'i' };
            }

            const efficiencyData = await data.aggregate([
                { $match: matchStage },
                {
                    $addFields: {
                        temperatureRange: {
                            $switch: {
                                branches: [
                                    { case: { $lt: ["$temperature.avg", 15] }, then: "Muito Frio (< 15°C)" },
                                    { case: { $lt: ["$temperature.avg", 20] }, then: "Frio (15-20°C)" },
                                    { case: { $lt: ["$temperature.avg", 25] }, then: "Ameno (20-25°C)" },
                                    { case: { $lt: ["$temperature.avg", 30] }, then: "Quente (25-30°C)" },
                                ],
                                default: "Muito Quente (> 30°C)"
                            }
                        },
                        efficiency: {
                            $cond: {
                                if: { $gt: ["$temperature.avg", 0] },
                                then: { $divide: ["$consumption", "$temperature.avg"] },
                                else: 0
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$temperatureRange",
                        avgEfficiency: { $avg: "$efficiency" },
                        avgConsumption: { $avg: "$consumption" },
                        avgTemperature: { $avg: "$temperature.avg" },
                        count: { $sum: 1 },
                        devices: { $addToSet: "$device_name" }
                    }
                },
                {
                    $project: {
                        temperatureRange: "$_id",
                        avgEfficiency: { $round: ["$avgEfficiency", 3] },
                        avgConsumption: { $round: ["$avgConsumption", 2] },
                        avgTemperature: { $round: ["$avgTemperature", 1] },
                        count: 1,
                        deviceCount: { $size: "$devices" },
                        _id: 0
                    }
                },
                { $sort: { avgTemperature: 1 } }
            ]);

            res.status(200).json({
                analysis: "Eficiência Energética por Faixa de Temperatura",
                data: efficiencyData,
                insights: {
                    mostEfficient: efficiencyData.reduce((max, curr) => 
                        curr.avgEfficiency > max.avgEfficiency ? curr : max
                    ),
                    leastEfficient: efficiencyData.reduce((min, curr) => 
                        curr.avgEfficiency < min.avgEfficiency ? curr : min
                    )
                }
            });
        } catch (erro) {
            next(erro);
        }
    }

    // 3. Análise de Anomalias e Picos de Consumo
    static async getConsumptionAnomalies(req, res, next) {
        try {
            const { startDate, endDate, device_name, threshold = 2 } = req.query;
            
            let matchStage = {};
            if (startDate && endDate) {
                matchStage.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (device_name) {
                matchStage.device_name = { $regex: device_name, $options: 'i' };
            }

            // Calcular estatísticas por dispositivo
            const deviceStats = await data.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: "$device_name",
                        avgConsumption: { $avg: "$consumption" },
                        stdDev: { $stdDevPop: "$consumption" },
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Buscar anomalias baseadas nas estatísticas
            const anomalies = [];
            
            for (const deviceStat of deviceStats) {
                const deviceMatchStage = {
                    ...matchStage,
                    device_name: deviceStat._id
                };

                const deviceAnomalies = await data.find({
                    ...deviceMatchStage,
                    $expr: {
                        $gt: [
                            { $abs: { $subtract: ["$consumption", deviceStat.avgConsumption] } },
                            { $multiply: [parseFloat(threshold), deviceStat.stdDev] }
                        ]
                    }
                });

                // Adicionar classificação de anomalia
                const classifiedAnomalies = deviceAnomalies.map(anomaly => ({
                    ...anomaly.toObject(),
                    anomalyLevel: anomaly.consumption > (deviceStat.avgConsumption + 2 * deviceStat.stdDev) ? "Alto" : "Médio",
                    deviceAvg: Math.round(deviceStat.avgConsumption * 100) / 100,
                    deviation: Math.round(Math.abs(anomaly.consumption - deviceStat.avgConsumption) * 100) / 100
                }));

                anomalies.push(...classifiedAnomalies);
            }

            // Ordenar por consumo (maior primeiro)
            anomalies.sort((a, b) => b.consumption - a.consumption);

            res.status(200).json({
                analysis: "Detecção de Anomalias de Consumo",
                threshold: `${threshold} desvios padrão`,
                anomaliesCount: anomalies.length,
                data: anomalies,
                deviceStatistics: deviceStats.map(stat => ({
                    device_name: stat._id,
                    avgConsumption: Math.round(stat.avgConsumption * 100) / 100,
                    stdDev: Math.round(stat.stdDev * 100) / 100,
                    count: stat.count
                }))
            });
        } catch (erro) {
            console.error("Erro em getConsumptionAnomalies:", erro);
            next(erro);
        }
    }

    // 4. Análise de Padrões Sazonais (por dia da semana)
    static async getSeasonalPatterns(req, res, next) {
        try {
            const { startDate, endDate, device_name } = req.query;
            
            let matchStage = {};
            if (startDate && endDate) {
                matchStage.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (device_name) {
                matchStage.device_name = { $regex: device_name, $options: 'i' };
            }

            const patterns = await data.aggregate([
                { $match: matchStage },
                {
                    $addFields: {
                        dayOfWeek: { $dayOfWeek: "$date" },
                        dayName: {
                            $switch: {
                                branches: [
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 1] }, then: "Domingo" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 2] }, then: "Segunda" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 3] }, then: "Terça" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 4] }, then: "Quarta" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 5] }, then: "Quinta" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 6] }, then: "Sexta" },
                                    { case: { $eq: [{ $dayOfWeek: "$date" }, 7] }, then: "Sábado" }
                                ],
                                default: "Desconhecido"
                            }
                        },
                        weekdayType: {
                            $cond: {
                                if: { $in: [{ $dayOfWeek: "$date" }, [1, 7]] },
                                then: "Final de Semana",
                                else: "Dia Útil"
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            dayName: "$dayName",
                            dayOfWeek: "$dayOfWeek",
                            weekdayType: "$weekdayType"
                        },
                        avgConsumption: { $avg: "$consumption" },
                        totalConsumption: { $sum: "$consumption" },
                        avgTemperature: { $avg: "$temperature.avg" },
                        count: { $sum: 1 },
                        maxConsumption: { $max: "$consumption" },
                        minConsumption: { $min: "$consumption" }
                    }
                },
                {
                    $project: {
                        dayName: "$_id.dayName",
                        dayOfWeek: "$_id.dayOfWeek",
                        weekdayType: "$_id.weekdayType",
                        avgConsumption: { $round: ["$avgConsumption", 2] },
                        totalConsumption: { $round: ["$totalConsumption", 2] },
                        avgTemperature: { $round: ["$avgTemperature", 1] },
                        count: 1,
                        maxConsumption: { $round: ["$maxConsumption", 2] },
                        minConsumption: { $round: ["$minConsumption", 2] },
                        _id: 0
                    }
                },
                { $sort: { dayOfWeek: 1 } }
            ]);

            // Análise de fim de semana vs dias úteis - CORRIGIDA
            const weekdayAnalysis = await data.aggregate([
                { $match: matchStage },
                {
                    $addFields: {
                        weekdayType: {
                            $cond: {
                                if: { $in: [{ $dayOfWeek: "$date" }, [1, 7]] },
                                then: "Final de Semana",
                                else: "Dia Útil"
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$weekdayType",
                        avgConsumption: { $avg: "$consumption" },
                        totalConsumption: { $sum: "$consumption" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        type: "$_id",
                        avgConsumption: { $round: ["$avgConsumption", 2] },
                        totalConsumption: { $round: ["$totalConsumption", 2] },
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            res.status(200).json({
                analysis: "Padrões Sazonais de Consumo",
                dailyPatterns: patterns,
                weekdayAnalysis: weekdayAnalysis,
                insights: {
                    highestConsumptionDay: patterns.length > 0 ? patterns.reduce((max, curr) => 
                        curr.avgConsumption > max.avgConsumption ? curr : max
                    ) : null,
                    lowestConsumptionDay: patterns.length > 0 ? patterns.reduce((min, curr) => 
                        curr.avgConsumption < min.avgConsumption ? curr : min
                    ) : null
                }
            });
        } catch (erro) {
            console.error("Erro em getSeasonalPatterns:", erro);
            next(erro);
        }
    }

    // 5. Análise de Correlação Temperatura-Consumo
    static async getTemperatureCorrelation(req, res, next) {
        try {
            const { startDate, endDate, device_name } = req.query;
            
            let matchStage = {};
            if (startDate && endDate) {
                matchStage.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (device_name) {
                matchStage.device_name = { $regex: device_name, $options: 'i' };
            }

            const correlationData = await data.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: "$device_name",
                        correlationPoints: {
                            $push: {
                                temperature: "$temperature.avg",
                                consumption: "$consumption",
                                date: "$date"
                            }
                        },
                        avgTemp: { $avg: "$temperature.avg" },
                        avgConsumption: { $avg: "$consumption" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        device_name: "$_id",
                        correlationPoints: 1,
                        avgTemp: { $round: ["$avgTemp", 1] },
                        avgConsumption: { $round: ["$avgConsumption", 2] },
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            // Análise de faixas de temperatura
            const temperatureRanges = await data.aggregate([
                { $match: matchStage },
                {
                    $bucket: {
                        groupBy: "$temperature.avg",
                        boundaries: [0, 15, 20, 25, 30, 35, 100],
                        default: "Outros",
                        output: {
                            avgConsumption: { $avg: "$consumption" },
                            count: { $sum: 1 },
                            devices: { $addToSet: "$device_name" },
                            minTemp: { $min: "$temperature.avg" },
                            maxTemp: { $max: "$temperature.avg" }
                        }
                    }
                }
            ]);

            res.status(200).json({
                analysis: "Correlação Temperatura-Consumo",
                deviceCorrelations: correlationData,
                temperatureRanges: temperatureRanges,
                summary: {
                    totalDevices: correlationData.length,
                    totalDataPoints: correlationData.reduce((sum, device) => sum + device.count, 0)
                }
            });
        } catch (erro) {
            next(erro);
        }
    }

    // 6. Análise de Custo de Energia
    static async getEnergyCostAnalysis(req, res, next) {
        try {
            const { startDate, endDate, device_name, tariffRate = 0.65 } = req.query;
            
            let matchStage = {};
            if (startDate && endDate) {
                matchStage.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (device_name) {
                matchStage.device_name = { $regex: device_name, $options: 'i' };
            }

            const costAnalysis = await data.aggregate([
                { $match: matchStage },
                {
                    $addFields: {
                        hour: { $hour: "$date" },
                        cost: { $multiply: ["$consumption", parseFloat(tariffRate)] },
                        timeOfDay: {
                            $switch: {
                                branches: [
                                    { case: { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 12] }] }, then: "Manhã" },
                                    { case: { $and: [{ $gte: ["$hour", 12] }, { $lt: ["$hour", 18] }] }, then: "Tarde" },
                                    { case: { $and: [{ $gte: ["$hour", 18] }, { $lt: ["$hour", 22] }] }, then: "Noite" },
                                ],
                                default: "Madrugada"
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            device: "$device_name",
                            timeOfDay: "$timeOfDay"
                        },
                        totalCost: { $sum: "$cost" },
                        totalConsumption: { $sum: "$consumption" },
                        avgCostPerHour: { $avg: "$cost" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.device",
                        timeOfDayCosts: {
                            $push: {
                                timeOfDay: "$_id.timeOfDay",
                                totalCost: { $round: ["$totalCost", 2] },
                                totalConsumption: { $round: ["$totalConsumption", 2] },
                                count: "$count"
                            }
                        },
                        totalDeviceCost: { $sum: "$totalCost" },
                        totalDeviceConsumption: { $sum: "$totalConsumption" }
                    }
                },
                {
                    $project: {
                        device_name: "$_id",
                        timeOfDayCosts: 1,
                        totalDeviceCost: { $round: ["$totalDeviceCost", 2] },
                        totalDeviceConsumption: { $round: ["$totalDeviceConsumption", 2] },
                        avgCostPerKWh: { 
                            $round: [{ 
                                $divide: ["$totalDeviceCost", "$totalDeviceConsumption"] 
                            }, 3] 
                        },
                        _id: 0
                    }
                },
                { $sort: { totalDeviceCost: -1 } }
            ]);

            // Resumo geral de custos
            const totalSummary = await data.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalConsumption: { $sum: "$consumption" },
                        totalRecords: { $sum: 1 },
                        avgConsumption: { $avg: "$consumption" }
                    }
                },
                {
                    $project: {
                        totalConsumption: { $round: ["$totalConsumption", 2] },
                        totalCost: { $round: [{ $multiply: ["$totalConsumption", parseFloat(tariffRate)] }, 2] },
                        avgConsumption: { $round: ["$avgConsumption", 2] },
                        avgCostPerRecord: { $round: [{ $multiply: ["$avgConsumption", parseFloat(tariffRate)] }, 3] },
                        totalRecords: 1,
                        _id: 0
                    }
                }
            ]);

            res.status(200).json({
                analysis: "Análise de Custo de Energia",
                tariffRate: `R$ ${tariffRate}/kWh`,
                deviceCosts: costAnalysis,
                summary: totalSummary[0] || {},
                insights: {
                    mostExpensiveDevice: costAnalysis[0] || null,
                    leastExpensiveDevice: costAnalysis[costAnalysis.length - 1] || null,
                    totalDevicesAnalyzed: costAnalysis.length
                }
            });
        } catch (erro) {
            next(erro);
        }
    }

    // 7. Análise Comparativa Mensal
    static async getMonthlyComparison(req, res, next) {
        try {
            const { device_name } = req.query;
            
            let matchStage = {};
            if (device_name) {
                matchStage.device_name = { $regex: device_name, $options: 'i' };
            }

            const monthlyData = await data.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" },
                            device: "$device_name"
                        },
                        totalConsumption: { $sum: "$consumption" },
                        avgConsumption: { $avg: "$consumption" },
                        avgTemperature: { $avg: "$temperature.avg" },
                        count: { $sum: 1 },
                        maxConsumption: { $max: "$consumption" },
                        minConsumption: { $min: "$consumption" }
                    }
                },
                {
                    $addFields: {
                        monthName: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$_id.month", 1] }, then: "Janeiro" },
                                    { case: { $eq: ["$_id.month", 2] }, then: "Fevereiro" },
                                    { case: { $eq: ["$_id.month", 3] }, then: "Março" },
                                    { case: { $eq: ["$_id.month", 4] }, then: "Abril" },
                                    { case: { $eq: ["$_id.month", 5] }, then: "Maio" },
                                    { case: { $eq: ["$_id.month", 6] }, then: "Junho" },
                                    { case: { $eq: ["$_id.month", 7] }, then: "Julho" },
                                    { case: { $eq: ["$_id.month", 8] }, then: "Agosto" },
                                    { case: { $eq: ["$_id.month", 9] }, then: "Setembro" },
                                    { case: { $eq: ["$_id.month", 10] }, then: "Outubro" },
                                    { case: { $eq: ["$_id.month", 11] }, then: "Novembro" },
                                    { case: { $eq: ["$_id.month", 12] }, then: "Dezembro" }
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        year: "$_id.year",
                        month: "$_id.month",
                        monthName: 1,
                        device_name: "$_id.device",
                        totalConsumption: { $round: ["$totalConsumption", 2] },
                        avgConsumption: { $round: ["$avgConsumption", 2] },
                        avgTemperature: { $round: ["$avgTemperature", 1] },
                        count: 1,
                        maxConsumption: { $round: ["$maxConsumption", 2] },
                        minConsumption: { $round: ["$minConsumption", 2] },
                        _id: 0
                    }
                },
                { $sort: { year: 1, month: 1, device_name: 1 } }
            ]);

            res.status(200).json({
                analysis: "Comparação Mensal de Consumo",
                data: monthlyData,
                summary: {
                    totalMonths: [...new Set(monthlyData.map(item => `${item.year}-${item.month}`))].length,
                    totalDevices: [...new Set(monthlyData.map(item => item.device_name))].length,
                    averageMonthlyConsumption: monthlyData.reduce((sum, item) => sum + item.totalConsumption, 0) / monthlyData.length
                }
            });
        } catch (erro) {
            next(erro);
        }
    }
}

export default AnalyticsController;