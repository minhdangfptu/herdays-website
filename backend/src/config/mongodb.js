/**
* Anh em Twobars: Giang Dam, Louis, Antonie was here
* All our efforts are for a brighter future, where we can freely eat bread and drink bubble tea without worrying about someone stealing it.
* Updated by Louis on 2026-06-16
*/
import mongoose from 'mongoose';

import env from './environment.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.mongodbUri, {
            dbName: env.mongodbDbName
        });
        console.log(`MongoDB is connected successfully at host: ${conn.connection.host}, database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`Error connect to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
