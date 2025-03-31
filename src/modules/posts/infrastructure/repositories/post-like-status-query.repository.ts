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

        const [likesCount, dislikesCount] = await Promise.all([
            this.collection.countDocuments({ postId, status: 'Like' }),
            this.collection.countDocuments({ postId, status: 'Dislike' })
        ]);

        let myStatus: LikeStatusEnum = 'None';

        if (userId) {
            const userRecord = await this.collection.findOne({
                postId,
                userId
            });

            if (userRecord) {
                myStatus = userRecord.status;
            }
        }

        // Get newest likes (latest 3 users who liked the post)
        const newestLikes: NewestLike[] = await this.collection
            .find({ postId, status: 'Like' })
            .sort({ createdAt: -1 })
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