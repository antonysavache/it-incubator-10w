import mongoose, { Document, Model } from 'mongoose';

export abstract class BaseCommandRepository<T extends Document, CreateModel> {
    constructor(protected model: Model<T>) {}

    async create(data: any): Promise<string> {
        const newItem = new this.model(data);
        await newItem.save();
        return newItem._id.toString();
    }

    async update(id: string, data: Partial<CreateModel>): Promise<boolean> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return false;
        }

        const updateData: Record<string, any> = { ...data };

        const result = await this.model.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: updateData }
        );

        return result.matchedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return false;
        }

        const result = await this.model.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
        return result.deletedCount === 1;
    }

    async deleteAll(): Promise<void> {
        await this.model.deleteMany({});
    }
}