import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
    console.log(`✅ Servidor Smart Energy rodando na porta ${PORT}`);
});