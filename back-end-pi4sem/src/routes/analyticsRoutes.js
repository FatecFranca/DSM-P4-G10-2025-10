
import express from "express";
import AnalyticsController from "../controllers/analyticsController.js";

const routes = express.Router();

// Análise de consumo por dia da semana
routes.get("/analytics/daily-consumption", AnalyticsController.getConsumptionByDay);

// Análise de eficiência energética por temperatura
routes.get("/analytics/energy-efficiency", AnalyticsController.getEnergyEfficiency);

// Detecção de anomalias de consumo
routes.get("/analytics/anomalies", AnalyticsController.getConsumptionAnomalies);

// Análise de padrões sazonais (dias da semana)
routes.get("/analytics/seasonal-patterns", AnalyticsController.getSeasonalPatterns);

// Análise de correlação temperatura-consumo
routes.get("/analytics/temperature-correlation", AnalyticsController.getTemperatureCorrelation);

// Análise de custo de energia
routes.get("/analytics/energy-cost", AnalyticsController.getEnergyCostAnalysis);

// Comparação mensal de consumo
routes.get("/analytics/monthly-comparison", AnalyticsController.getMonthlyComparison);

export default routes;