import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { NewestLike, PostLikesInfo } from "../../domain/interfaces/post.interface";
import { LikeStatusEnum } from "../../../comments/domain/interfaces/like-status.interface";
import { PostLikeStatusModel } from "../../domain/interfaces/post-like-status.interface";

export class PostLikeStatusQueryRepository extends BaseQueryRepository<PostLikeStatusModel> {
    constructor() {
        super('postLikeStatus');
    }

    async getLikesInfo(postId: string, userId?: string): Promise<PostLikesInfo> {
        this.checkInit();

        console.log(`[LIKES DEBUG] Getting likes for post ${postId} with userId ${userId || 'NONE'}`);

        const [likesCount, dislikesCount] = await Promise.all([
            this.collection.countDocuments({ postId, status: 'Like' }),
            this.collection.countDocuments({ postId, status: 'Dislike' })
        ]);

        console.log(`[LIKES DEBUG] Counts: likes=${likesCount}, dislikes=${dislikesCount}`);

        let myStatus: LikeStatusEnum = 'None';

        if (userId) {
            try {
                // For debugging, get ALL like status records for this post
                const allLikes = await this.collection.find({ postId }).toArray();
                console.log(`[LIKES DEBUG] All like records for post ${postId}:`,
                    allLikes.map(r => ({ userId: r.userId, status: r.status })));

                const userRecord = await this.collection.findOne({
                    postId,
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

        // Get newest likes (latest 3 users who liked the post)
        const newestLikes: NewestLike[] = await this.collection
            .find({ postId, status: 'Like' })
            .sort({ updatedAt: -1 })
            .limit(3)
            .toArray()
            .then(items => items.map(item => ({
                addedAt: item.createdAt,
                userId: item.userId,
                login: item.userLogin
            })));

        return {
            likesCount,
            dislikesCount,
            myStatus,
            newestLikes
        };
    }

    async getUserStatus(postId: string, userId: string): Promise<LikeStatusEnum> {
        this.checkInit();

        const record = await this.collection.findOne({ postId, userId });
        return record ? record.status : 'None';
    }
}