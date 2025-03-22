import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { LikesInfo, LikeStatusEnum, LikeStatusModel } from "../../domain/interfaces/like-status.interface";

export class LikeStatusQueryRepository extends BaseQueryRepository<LikeStatusModel> {
    constructor() {
        super('commentLikeStatus');
    }

    async getLikesInfo(commentId: string, userId?: string): Promise<LikesInfo> {
        this.checkInit();

        console.log(`[LIKES DEBUG] Getting likes for comment ${commentId} with userId ${userId || 'NONE'}`);

        const [likesCount, dislikesCount] = await Promise.all([
            this.collection.countDocuments({ commentId, status: 'Like' }),
            this.collection.countDocuments({ commentId, status: 'Dislike' })
        ]);

        console.log(`[LIKES DEBUG] Counts: likes=${likesCount}, dislikes=${dislikesCount}`);

        let myStatus: LikeStatusEnum = 'None';

        if (userId) {
            try {
                // For debugging, get ALL like status records for this comment
                const allLikes = await this.collection.find({ commentId }).toArray();
                console.log(`[LIKES DEBUG] All like records for comment ${commentId}:`,
                    allLikes.map(r => ({ userId: r.userId, status: r.status })));

                const userRecord = await this.collection.findOne({
                    commentId,
                    userId
                });

                console.log(`[LIKES DEBUG] User record for userId=${userId}:`, userRecord);

                if (userRecord) {
                    myStatus = userRecord.status;
                    console.log(`[LIKES DEBUG] Setting myStatus to ${myStatus}`);
                } else {
                    console.log(`[LIKES DEBUG] No record found for userId=${userId}, setting myStatus=None`);
                }
            } catch (error) {
                console.error(`[LIKES DEBUG] Error finding status:`, error);
            }
        } else {
            console.log(`[LIKES DEBUG] No userId provided, setting myStatus=None`);
        }

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