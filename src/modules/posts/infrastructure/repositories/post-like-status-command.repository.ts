import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { ObjectId } from "mongodb";
import { LikeStatusEnum } from "../../../comments/domain/interfaces/like-status.interface";
import { PostLikeStatusCreateModel, PostLikeStatusModel } from "../../domain/interfaces/post-like-status.interface";

export class PostLikeStatusCommandRepository extends BaseCommandRepository<PostLikeStatusModel, PostLikeStatusCreateModel> {
    constructor() {
        super('postLikeStatus');
    }

    async findAndUpdateStatus(userId: string, postId: string, userLogin: string, status: LikeStatusEnum): Promise<boolean> {
        this.checkInit();

        const now = new Date().toISOString();

        try {
            console.log(`Finding/updating post like status for userId=${userId}, postId=${postId}, status=${status}`);

            const existingStatus = await this.collection.findOne({ userId, postId });

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
                return result.modifiedCount > 0;
            } else {
                console.log(`No existing status found, creating new with status: ${status}`);

                await this.create({
                    userId,
                    userLogin,
                    postId,
                    status
                });
                return true;
            }
        } catch (error) {
            console.error("Error updating post like status:", error);
            return false;
        }
    }

    async create(data: PostLikeStatusCreateModel): Promise<string> {
        this.checkInit();

        const now = new Date().toISOString();

        const likeStatusModel: PostLikeStatusModel = {
            _id: new ObjectId(),
            userId: data.userId,
            userLogin: data.userLogin,
            postId: data.postId,
            status: data.status,
            createdAt: now,
            updatedAt: now
        };

        await this.collection.insertOne(likeStatusModel);
        return likeStatusModel._id.toString();
    }
}