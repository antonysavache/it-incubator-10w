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
            const existingStatus = await this.collection.findOne({ userId, postId });

            if (existingStatus) {
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