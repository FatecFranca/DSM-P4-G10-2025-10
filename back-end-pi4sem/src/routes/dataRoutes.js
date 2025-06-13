import express from "express";
import DataController from "../controllers/dataController.js";
const routes = express.Router();

// Lista todos os dados
routes.get("/data", DataController.listData); 

// Busca dados por período
routes.get("/data/period", DataController.findDataByDateRange); 

// Estatísticas por período
routes.get("/data/stats", DataController.getDataStatsByDateRange); 

// Busca dados por ID
routes.get("/data/:id", DataController.findDataById); 

// Cria novos dados
routes.post("/data", DataController.createData); 

// Atualiza dados por ID
routes.put("/data/:id", DataController.updateDataById); 

// Remove dados por ID
routes.delete("/data/:id", DataController.deleteDataById); 

export default routes;