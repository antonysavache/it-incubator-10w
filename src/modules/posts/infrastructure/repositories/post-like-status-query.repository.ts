// src/modules/posts/infrastructure/repositories/post-like-status-query.repository.ts
import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { ObjectId } from "mongodb";
import { LikeStatusEnum } from "../../../comments/domain/interfaces/like-status.interface";

// Define models locally to avoid external dependencies
interface PostLikeStatusModel {
    _id: ObjectId;
    userId: string;
    userLogin: string;
    postId: string;
    status: LikeStatusEnum;
    createdAt: string;
    updatedAt: string;
}

interface NewestLike {
    addedAt: string;
    userId: string;
    login: string;
}

interface PostLikesInfo {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusEnum;
    newestLikes: NewestLike[];
}

export class PostLikeStatusQueryRepository extends BaseQueryRepository<PostLikeStatusModel> {
    constructor() {
        super('postLikeStatus');
    }

    async getLikesInfo(postId: string, userId?: string): Promise<PostLikesInfo> {
        try {
            this.checkInit();

            if (!this.collection) {
                console.error('Collection not initialized');
                return {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: []
                };
            }

            console.log(`Getting likes info for postId=${postId}, userId=${userId || 'none'}`);

            // Get likes count
            const likesCount = await this.collection.countDocuments({
                postId,
                status: 'Like'
            });

            // Get dislikes count
            const dislikesCount = await this.collection.countDocuments({
                postId,
                status: 'Dislike'
            });

            // Get user's like status
            let myStatus: LikeStatusEnum = 'None';
            if (userId) {
                const userLike = await this.collection.findOne({
                    postId,
                    userId
                });

                if (userLike) {
                    myStatus = userLike.status;
                }
            }

            // Get 3 newest likes
            const newestLikes = await this.collection
                .find({
                    postId,
                    status: 'Like'
                })
                .sort({
                    updatedAt: -1
                })
                .limit(3)
                .toArray();

            // Map to required format
            const mappedNewestLikes: NewestLike[] = newestLikes.map(like => ({
                addedAt: like.createdAt,
                userId: like.userId,
                login: like.userLogin || 'unknown'
            }));

            console.log(`Like info results: likes=${likesCount}, dislikes=${dislikesCount}, myStatus=${myStatus}, newestLikes.length=${mappedNewestLikes.length}`);

            return {
                likesCount,
                dislikesCount,
                myStatus,
                newestLikes: mappedNewestLikes
            };
        } catch (error) {
            console.error('Error in getLikesInfo:', error);
            // Return default values in case of error
            return {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            };
        }
    }

    async getUserStatus(postId: string, userId: string): Promise<LikeStatusEnum> {
        try {
            this.checkInit();

            if (!this.collection) {
                console.error('Collection not initialized');
                return 'None';
            }

            if (!userId || !postId) {
                console.warn('Missing userId or postId in getUserStatus');
                return 'None';
            }

            const record = await this.collection.findOne({
                postId,
                userId
            });

            return record ? record.status : 'None';
        } catch (error) {
            console.error('Error in getUserStatus:', error);
            return 'None';
        }
    }
}