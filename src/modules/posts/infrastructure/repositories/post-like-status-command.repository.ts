// src/modules/posts/infrastructure/repositories/post-like-status-command.repository.ts
import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { ObjectId } from "mongodb";
import { LikeStatusEnum } from "../../../comments/domain/interfaces/like-status.interface";

// Define a more robust model that doesn't rely on external interfaces
interface PostLikeStatusModel {
    _id: ObjectId;
    userId: string;
    userLogin: string;
    postId: string;
    status: LikeStatusEnum;
    createdAt: string;
    updatedAt: string;
}

interface PostLikeStatusCreateModel {
    userId: string;
    userLogin: string;
    postId: string;
    status: LikeStatusEnum;
}

export class PostLikeStatusCommandRepository extends BaseCommandRepository<PostLikeStatusModel, PostLikeStatusCreateModel> {
    constructor() {
        super('postLikeStatus');
    }

    async findAndUpdateStatus(userId: string, postId: string, userLogin: string, status: LikeStatusEnum): Promise<boolean> {
        try {
            this.checkInit();

            if (!this.collection) {
                console.error('Collection not initialized');
                return false;
            }

            const now = new Date().toISOString();
            console.log(`Finding existing status for userId=${userId}, postId=${postId}`);

            const existingStatus = await this.collection.findOne({
                userId: userId,
                postId: postId
            });

            if (existingStatus) {
                console.log(`Found existing status: ${existingStatus.status}, updating to: ${status}`);

                const result = await this.collection.updateOne(
                    { userId, postId },
                    {
                        $set: {
                            status,
                            updatedAt: now
                        }
                    }
                );

                return result.acknowledged && result.modifiedCount > 0;
            } else {
                console.log(`No existing status found, creating new status: ${status}`);

                // Use a default userLogin if none provided
                const safeUserLogin = userLogin || 'unknown';

                const newLikeStatus: PostLikeStatusModel = {
                    _id: new ObjectId(),
                    userId,
                    userLogin: safeUserLogin,
                    postId,
                    status,
                    createdAt: now,
                    updatedAt: now
                };

                const result = await this.collection.insertOne(newLikeStatus);
                return result.acknowledged;
            }
        } catch (error) {
            console.error("Error in findAndUpdateStatus:", error);
            return false;
        }
    }

    // Override create to add validation and better error handling
    async create(data: PostLikeStatusCreateModel): Promise<string> {
        try {
            this.checkInit();

            if (!this.collection) {
                throw new Error('Collection not initialized');
            }

            if (!data.userId || !data.postId) {
                throw new Error('Missing required fields: userId and postId are required');
            }

            const now = new Date().toISOString();
            const safeUserLogin = data.userLogin || 'unknown';

            const likeStatusModel: PostLikeStatusModel = {
                _id: new ObjectId(),
                userId: data.userId,
                userLogin: safeUserLogin,
                postId: data.postId,
                status: data.status,
                createdAt: now,
                updatedAt: now
            };

            const result = await this.collection.insertOne(likeStatusModel);

            if (!result.acknowledged) {
                throw new Error('Failed to insert post like status');
            }

            return likeStatusModel._id.toString();
        } catch (error) {
            console.error("Error creating post like status:", error);
            throw error;
        }
    }
}