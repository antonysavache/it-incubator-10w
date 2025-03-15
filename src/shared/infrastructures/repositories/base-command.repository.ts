// base-command.repository.ts
import {Collection, Filter, ObjectId, OptionalUnlessRequiredId, UpdateFilter} from 'mongodb';
import {getDatabase} from "../db/mongo-db";

export abstract class BaseCommandRepository<T, CreateModel> {
    protected collection: Collection<T> | null = null;

    constructor(protected collectionName: string) {}

    init() {
        if (!this.collection) {
            this.collection = getDatabase().collection<T>(this.collectionName);
        }
    }

    protected checkInit() {
        if (!this.collection) {
            throw new Error('Repository not initialized');
        }
    }

    async create(data: CreateModel): Promise<string> {
        this.checkInit();
        await this.collection.insertOne(data as OptionalUnlessRequiredId<T>);
        return data['_id'].toString();
    }

    async update(id: string, data: Partial<CreateModel>): Promise<boolean> {
        this.checkInit();

        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) } as Filter<T>,
            { $set: data } as UpdateFilter<T>
        );

        return result.matchedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        this.checkInit();

        const result = await this.collection.deleteOne(
            { _id: new ObjectId(id) } as Filter<T>
        );

        return result.deletedCount === 1;
    }

    async deleteAll(): Promise<void> {
        this.checkInit();
        await this.collection.deleteMany({});
    }
}