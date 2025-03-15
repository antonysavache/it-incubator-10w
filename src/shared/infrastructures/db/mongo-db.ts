import { MongoClient, Db } from 'mongodb';
import { SETTINGS } from '../../../configs/settings';

let client: MongoClient;
let database: Db;

export async function connectToDatabase(): Promise<Db> {
    try {
        if (client) {
            return database;
        }

        client = new MongoClient(SETTINGS.DB_URL);

        await client.connect();

        await client.db().command({ ping: 1 });

        database = client.db(SETTINGS.DB_NAME);

        console.log("Successfully connected to MongoDB");

        return database;
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
}

export function getDatabase(): Db {
    if (!database) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return database;
}

export async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        console.log("MongoDB connection closed");
    }
}