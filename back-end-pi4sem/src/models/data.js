import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    device_name: { type: mongoose.Schema.Types.String, required: [true, "O nome do dispositivo é obrigatório"] },
    date: { type: mongoose.Schema.Types.Date, required: [true, "A data é obrigatória"] },
    consumption: { type: mongoose.Schema.Types.Number, required: [true, "O valor de consumo é obrigatório"] },
    temperature: { type: mongoose.Schema.Types.Mixed, required: [true, "Os valores de temperaturas são obrigatórios"] },
    event: { type: mongoose.Schema.Types.String } // Campo opcional para eventos
});

const data = mongoose.model("data", dataSchema, "data");
export default data;