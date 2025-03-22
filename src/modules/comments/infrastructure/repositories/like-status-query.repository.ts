import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { LikesInfo, LikeStatusEnum, LikeStatusModel } from "../../domain/interfaces/like-status.interface";

export class LikeStatusQueryRepository extends BaseQueryRepository<LikeStatusModel> {
    constructor() {
        super('commentLikeStatus');
    }

// src/modules/comments/infrastructure/repositories/like-status-query.repository.ts
    async getLikesInfo(commentId: string, userId?: string): Promise<LikesInfo> {
        this.checkInit();

        try {
            // Нам нужны более подробные логи для отладки
            console.log(`Getting likes info for commentId=${commentId}, userId=${userId}`);

            const [likesCount, dislikesCount] = await Promise.all([
                this.collection.countDocuments({ commentId, status: 'Like' }),
                this.collection.countDocuments({ commentId, status: 'Dislike' })
            ]);

            console.log(`Found ${likesCount} likes and ${dislikesCount} dislikes`);

            let myStatus: LikeStatusEnum = 'None';

            if (userId) {
                const userStatus = await this.collection.findOne({ commentId, userId });
                console.log(`User status for userId=${userId}:`, userStatus);

                if (userStatus) {
                    myStatus = userStatus.status;
                }
            }

            console.log(`Returning myStatus=${myStatus}`);

            return {
                likesCount,
                dislikesCount,
                myStatus
            };
        } catch (error) {
            console.error(`Error getting likes info for commentId=${commentId}:`, error);
            return {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            };
        }
    }

    async getUserStatus(commentId: string, userId: string): Promise<LikeStatusEnum> {
        this.checkInit();

        const record = await this.collection.findOne({ commentId, userId });

        return record ? record.status : 'None';
    }
}