// eslint-disable-next-line no-unused-vars
import mongoose, { mongo } from "mongoose";

async function dbConnect() {
    // eslint-disable-next-line no-undef
    mongoose.connect(process.env.DB_CONNECTION_STRING);
    return mongoose.connection;
};

export default dbConnect;