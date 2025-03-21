import mongoose from 'mongoose';
import { SETTINGS } from '../../../configs/settings';

export async function connectToDatabase(): Promise<void> {
    try {
        await mongoose.connect(SETTINGS.DB_URL, {
            dbName: SETTINGS.DB_NAME
        });
        console.log("Successfully connected to MongoDB with Mongoose");
    } catch (error) {
        console.error("Failed to connect to MongoDB with Mongoose", error);
        throw error;
    }
}

export async function closeDatabaseConnection(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("Mongoose connection closed");
    }
}