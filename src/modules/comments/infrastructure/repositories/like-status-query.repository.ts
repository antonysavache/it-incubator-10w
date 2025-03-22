import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { LikesInfo, LikeStatusEnum, LikeStatusModel } from "../../domain/interfaces/like-status.interface";

export class LikeStatusQueryRepository extends BaseQueryRepository<LikeStatusModel> {
    constructor() {
        super('commentLikeStatus');
    }

    async getLikesInfo(commentId: string, userId?: string): Promise<LikesInfo> {
        this.checkInit();

        console.log(`[LikeStatusQueryRepository] Getting likes info: commentId=${commentId}, userId=${userId}`);

        const [likesCount, dislikesCount] = await Promise.all([
            this.collection.countDocuments({ commentId, status: 'Like' }),
            this.collection.countDocuments({ commentId, status: 'Dislike' })
        ]);

        let myStatus: LikeStatusEnum = 'None';

        if (userId) {
            try {
                console.log(`[LikeStatusQueryRepository] Looking for status for userId=${userId}, commentId=${commentId}`);

                const userRecord = await this.collection.findOne({
                    commentId,
                    userId
                });

                console.log(`[LikeStatusQueryRepository] User record found:`, userRecord);

                if (userRecord) {
                    myStatus = userRecord.status;
                    console.log(`[LikeStatusQueryRepository] Setting myStatus=${myStatus}`);
                }
            } catch (error) {
                console.error(`[LikeStatusQueryRepository] Error finding user record:`, error);
            }
        } else {
            console.log(`[LikeStatusQueryRepository] No userId provided, status will be None`);
        }

        console.log(`[LikeStatusQueryRepository] Final likes info:`, {
            likesCount,
            dislikesCount,
            myStatus
        });

        return {
            likesCount,
            dislikesCount,
            myStatus
        };
    }


    async getUserStatus(commentId: string, userId: string): Promise<LikeStatusEnum> {
        this.checkInit();

        const record = await this.collection.findOne({ commentId, userId });

        return record ? record.status : 'None';
    }
}