import { BaseCommandRepository } from "../../../../../shared/infrastructures/repositories/base-command.repository";
import { UserDatabaseModel } from "../../interfaces/user.interface";
import { ObjectId } from "mongodb";

export class UsersCommandRepository extends BaseCommandRepository<UserDatabaseModel, UserDatabaseModel> {
    constructor() {
        super('users');
    }

    async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
        this.checkInit();
        const result = await this.collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { passwordHash } }
        );
        return result.modifiedCount === 1;
    }
}