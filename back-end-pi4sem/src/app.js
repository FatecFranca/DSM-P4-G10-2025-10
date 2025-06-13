import express from "express";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import handler404 from "./middlewares/handler404.js";

// Estabelece conexão com MongoDB
const conexao = await dbConnect();

// Listeners para eventos de conexão
conexao.on("error", (erro) => {
  console.error("❌ Erro ao conectar ao MongoDB:", erro);
});

conexao.once("open", () => {
  console.log("✅ Conectado ao MongoDB com sucesso!")
});

const app = express();

// Configuração CORS para permitir requisições cross-origin
app.use(cors());

// Middleware para parsing de JSON nas requisições
app.use(express.json());

// Registra todas as rotas da aplicação
routes(app);

// Middlewares de tratamento de erro (ordem importa)
app.use(handler404); // Captura rotas não encontradas
app.use(errorHandler); // Trata todos os erros

export default app;