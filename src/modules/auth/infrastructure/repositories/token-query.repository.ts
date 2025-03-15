import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { TokenDatabaseModel } from "../../domain/interfaces/token.interface";

export class TokenQueryRepository extends BaseQueryRepository<TokenDatabaseModel> {
    constructor() {
        super('tokens');
    }

    async findValidToken(token: string, type: 'ACCESS' | 'REFRESH'): Promise<TokenDatabaseModel | null> {
        try {
            this.checkInit();
            return await this.collection.findOne({
                token,
                tokenType: type,
                isValid: true,
                expiresAt: { $gt: new Date() }
            });
        } catch (error) {
            console.error('Error in findValidToken:', error);
            return null;
        }
    }
}