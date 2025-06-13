import express from "express";
import data from "./dataRoutes.js";
import analytics from "./analyticsRoutes.js";

const routes = (app) => {
    // Rota raiz com informações da API
    app.route("/").get((req, res) => res.status(200).send("Smart Energy API - Análise de Consumo Energético"));
    
    // Registra middlewares e rotas
    app.use(express.json(), data, analytics);
};

export default routes;