import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { PasswordRecoveryModel } from "../../domain/interfaces/password-recovery.interface";
import { getDatabase } from "../../../../shared/infrastructures/db/mongo-db";

export class PasswordRecoveryRepository extends BaseCommandRepository<PasswordRecoveryModel, Omit<PasswordRecoveryModel, '_id'>> {
    constructor() {
        super('passwordRecovery');
    }

    init() {
        if (!this.collection) {
            this.collection = getDatabase().collection<PasswordRecoveryModel>(this.collectionName);
        }
    }

    async findByCode(recoveryCode: string): Promise<PasswordRecoveryModel | null> {
        this.checkInit();
        return this.collection.findOne({ recoveryCode });
    }

    async findByUserId(userId: string): Promise<PasswordRecoveryModel | null> {
        this.checkInit();
        return this.collection.findOne({ userId, isUsed: false });
    }

    async markAsUsed(recoveryCode: string): Promise<boolean> {
        this.checkInit();
        const result = await this.collection.updateOne(
            { recoveryCode },
            { $set: { isUsed: true } }
        );
        return result.modifiedCount === 1;
    }
}