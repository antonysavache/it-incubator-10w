import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { ObjectId } from "mongodb";
import { LikeStatusEnum } from "../../../comments/domain/interfaces/like-status.interface";
import { NewestLike, PostLikesInfo } from "../../domain/interfaces/post.interface";

interface PostLikeStatusModel {
    _id: ObjectId;
    userId: string;
    userLogin: string;
    postId: string;
    status: LikeStatusEnum;
    createdAt: string;
    updatedAt: string;
}

export class PostLikeStatusQueryRepository extends BaseQueryRepository<PostLikeStatusModel> {
    constructor() {
        super('postLikeStatus');
    }

    async getLikesInfo(postId: string, userId?: string): Promise<PostLikesInfo> {
        this.checkInit();

        console.log(`Getting likes info for postId=${postId}, userId=${userId || 'none'}`);

        try {
            const [likesCount, dislikesCount] = await Promise.all([
                this.collection.countDocuments({ postId, status: 'Like' }),
                this.collection.countDocuments({ postId, status: 'Dislike' })
            ]);

            console.log(`Likes counts: ${likesCount}, dislikes: ${dislikesCount}`);

            let myStatus: LikeStatusEnum = 'None';

            if (userId) {
                const userStatus = await this.collection.findOne({ postId, userId });
                if (userStatus) {
                    myStatus = userStatus.status;
                    console.log(`User ${userId} has status ${myStatus} for post ${postId}`);
                }
            }

            const newestLikes = await this.collection
                .find({ postId, status: 'Like' })
                .sort({ updatedAt: -1 })
                .limit(3)
                .toArray();

            const newestLikesFormatted: NewestLike[] = newestLikes.map(like => ({
                addedAt: like.createdAt,
                userId: like.userId,
                login: like.userLogin || 'unknown'
            }));

            return {
                likesCount,
                dislikesCount,
                myStatus,
                newestLikes: newestLikesFormatted
            };
        } catch (error) {
            console.error(`Error getting likes info: ${error}`);
            return {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            };
        }
    }

    async getUserStatus(postId: string, userId: string): Promise<LikeStatusEnum> {
        this.checkInit();
        try {
            const status = await this.collection.findOne({ postId, userId });
            return status ? status.status : 'None';
        } catch (error) {
            console.error(`Error getting user status: ${error}`);
            return 'None';
        }
    }
}