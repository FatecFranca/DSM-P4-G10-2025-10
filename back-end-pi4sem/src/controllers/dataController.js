import data from "../models/data.js";

class DataController {
    // Lista todos os dados
    static async listData (req, res, next) {
        try {
            const listData = await data.find({});
            res.status(200).json(listData);
        } catch (erro) {
            next(erro);
        }
    };

    // Busca dados por ID específico
    static async findDataById (req, res, next) {
        try {
            const id = req.params.id;
            const dataFound = await data.findById(id);
            if (dataFound !== null) {
                res.status(200).json(dataFound);
            } else {
                res.status(400).send({message: "Id do dado não encontrado."}); 
            }
        } catch (erro) {
            next(erro);
        }
    };

    // Atualiza dados existentes por ID
    static async updateDataById (req, res, next) {
        try {
            const id = req.params.id;
            const updatedData = await data.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedData) {
                return res.status(404).json({ message: "Dado não encontrado." });
            }
            res.status(200).json(updatedData);
        } catch (erro) {
            next(erro);
        }
    };

    // Cria novos dados
    static async createData (req, res, next) {
        try {
            const newData = await data.create(req.body);
            res.status(201).json({ message: "Criado com sucesso!", data: newData });
        } catch (erro) {
            next(erro);
        }
    };

    // Remove dados por ID
    static async deleteDataById (req, res, next) {
        try {
            const id = req.params.id;
            await data.findByIdAndDelete(id);
            res.status(200).json({ message: "Dado excluído com sucesso!" });
        } catch (erro) {
            next(erro);
        }
    };

    // Busca dados filtrados por período de datas
    static async findDataByDateRange(req, res, next) {
        try {
            const { startDate, endDate, device_name } = req.query;
            
            // Validação de parâmetros obrigatórios
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    message: "Os parâmetros 'startDate' e 'endDate' são obrigatórios. Formato: YYYY-MM-DD ou timestamp" 
                });
            }

            let filter = {};
            let start, end;

            // Conversão de datas (suporta timestamp ou string)
            if (!isNaN(startDate)) {
                start = new Date(parseInt(startDate));
            } else {
                start = new Date(startDate);
            }
            
            if (!isNaN(endDate)) {
                end = new Date(parseInt(endDate));
            } else {
                end = new Date(endDate);
            }

            // Validação de formato de data
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ 
                    message: "Formato de data inválido. Use YYYY-MM-DD ou timestamp em millisegundos" 
                });
            }

            // Validação de ordem das datas
            if (start > end) {
                return res.status(400).json({ 
                    message: "A data inicial deve ser anterior à data final" 
                });
            }

            // Ajusta fim do dia para incluir registros do dia final
            end.setHours(23, 59, 59, 999);

            // Monta filtro de data
            filter.date = {
                $gte: start,
                $lte: end
            };

            // Filtro opcional por nome do dispositivo
            if (device_name) {
                filter.device_name = { $regex: device_name, $options: 'i' };
            }

            const dataFound = await data.find(filter).sort({ date: 1 });
            
            res.status(200).json({
                count: dataFound.length,
                period: {
                    start: start.toISOString(),
                    end: end.toISOString()
                },
                filter_applied: filter,
                data: dataFound
            });
        } catch (erro) {
            next(erro);
        }
    };

    // Gera estatísticas dos dados por período
    static async getDataStatsByDateRange(req, res, next) {
        try {
            const { startDate, endDate, device_name } = req.query;
            
            // Validação de parâmetros
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    message: "Os parâmetros 'startDate' e 'endDate' são obrigatórios" 
                });
            }

            // Conversão e validação de datas
            let start = !isNaN(startDate) ? new Date(parseInt(startDate)) : new Date(startDate);
            let end = !isNaN(endDate) ? new Date(parseInt(endDate)) : new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ 
                    message: "Formato de data inválido" 
                });
            }

            end.setHours(23, 59, 59, 999);

            // Filtro base para agregação
            let matchStage = {
                date: { $gte: start, $lte: end }
            };

            if (device_name) {
                matchStage.device_name = { $regex: device_name, $options: 'i' };
            }

            // Estatísticas gerais usando MongoDB aggregation
            const generalStats = await data.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalRecords: { $sum: 1 },
                        totalConsumption: { $sum: "$consumption" },
                        avgConsumption: { $avg: "$consumption" },
                        maxConsumption: { $max: "$consumption" },
                        minConsumption: { $min: "$consumption" },
                        avgTemperature: { $avg: "$temperature.avg" },
                        maxTemperature: { $max: "$temperature.max" },
                        minTemperature: { $min: "$temperature.min" },
                        devices: { $addToSet: "$device_name" }
                    }
                }
            ]);

            // Estatísticas por dispositivo
            const consumptionByDevice = await data.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: "$device_name",
                        totalConsumption: { $sum: "$consumption" },
                        avgConsumption: { $avg: "$consumption" },
                        maxConsumption: { $max: "$consumption" },
                        minConsumption: { $min: "$consumption" },
                        recordCount: { $sum: 1 },
                        avgTemperature: { $avg: "$temperature.avg" },
                        maxTemperature: { $max: "$temperature.max" },
                        minTemperature: { $min: "$temperature.min" },
                        firstRecord: { $min: "$date" },
                        lastRecord: { $max: "$date" }
                    }
                },
                {
                    $sort: { totalConsumption: -1 }
                },
                {
                    // Formatação dos dados de saída
                    $project: {
                        _id: 0,
                        device_name: "$_id",
                        totalConsumption: { $round: ["$totalConsumption", 2] },
                        avgConsumption: { $round: ["$avgConsumption", 2] },
                        maxConsumption: { $round: ["$maxConsumption", 2] },
                        minConsumption: { $round: ["$minConsumption", 2] },
                        recordCount: 1,
                        avgTemperature: { $round: ["$avgTemperature", 1] },
                        maxTemperature: { $round: ["$maxTemperature", 1] },
                        minTemperature: { $round: ["$minTemperature", 1] },
                        firstRecord: 1,
                        lastRecord: 1
                    }
                }
            ]);

            // Monta resposta formatada com estatísticas completas
            const response = {
                period: {
                    start: start.toISOString(),
                    end: end.toISOString()
                },
                generalStatistics: generalStats[0] ? {
                    totalRecords: generalStats[0].totalRecords,
                    totalConsumption: Math.round(generalStats[0].totalConsumption * 100) / 100,
                    avgConsumption: Math.round(generalStats[0].avgConsumption * 100) / 100,
                    maxConsumption: Math.round(generalStats[0].maxConsumption * 100) / 100,
                    minConsumption: Math.round(generalStats[0].minConsumption * 100) / 100,
                    avgTemperature: Math.round(generalStats[0].avgTemperature * 10) / 10,
                    maxTemperature: Math.round(generalStats[0].maxTemperature * 10) / 10,
                    minTemperature: Math.round(generalStats[0].minTemperature * 10) / 10,
                    uniqueDevices: generalStats[0].devices.length,
                    devices: generalStats[0].devices
                } : {
                    totalRecords: 0,
                    message: "Nenhum dado encontrado para o período especificado"
                },
                consumptionByDevice: consumptionByDevice,
                summary: {
                    totalDevices: consumptionByDevice.length,
                    totalConsumptionAllDevices: Math.round(consumptionByDevice.reduce((sum, device) => sum + device.totalConsumption, 0) * 100) / 100,
                    // Dispositivo com maior consumo
                    mostConsumingDevice: consumptionByDevice.length > 0 ? {
                        name: consumptionByDevice[0].device_name,
                        consumption: consumptionByDevice[0].totalConsumption
                    } : null,
                    // Dispositivo com menor consumo
                    leastConsumingDevice: consumptionByDevice.length > 0 ? {
                        name: consumptionByDevice[consumptionByDevice.length - 1].device_name,
                        consumption: consumptionByDevice[consumptionByDevice.length - 1].totalConsumption
                    } : null
                }
            };

            res.status(200).json(response);
        } catch (erro) {
            next(erro);
        }
    }
};

export default DataController;