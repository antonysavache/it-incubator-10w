import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { TokenCreateModel, TokenDatabaseModel } from "../../domain/interfaces/token.interface";
import { ObjectId } from "mongodb";

export class TokenCommandRepository extends BaseCommandRepository<TokenDatabaseModel, TokenCreateModel> {
    constructor() {
        super('tokens');
    }

    async saveTokens(userId: string, accessToken: string, refreshToken: string): Promise<void> {
        this.checkInit();

        const now = new Date();
        const accessTokenExpiry = new Date(now.getTime() + 1000 * 1000); // 10 seconds
        const refreshTokenExpiry = new Date(now.getTime() + 20000 * 1000); // 20 seconds

        await this.collection.insertMany([
            {
                _id: new ObjectId(),
                token: accessToken,
                userId,
                issuedAt: now,
                expiresAt: accessTokenExpiry,
                isValid: true,
                tokenType: 'ACCESS'
            },
            {
                _id: new ObjectId(),
                token: refreshToken,
                userId,
                issuedAt: now,
                expiresAt: refreshTokenExpiry,
                isValid: true,
                tokenType: 'REFRESH'
            }
        ]);
    }

    async invalidateToken(token: string): Promise<boolean> {
        this.checkInit();
        const result = await this.collection.updateOne(
            { token },
            { $set: { isValid: false } }
        );
        return result.modifiedCount === 1;
    }
}
