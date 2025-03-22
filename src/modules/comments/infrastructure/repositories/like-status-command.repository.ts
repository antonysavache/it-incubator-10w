import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { LikeStatusCreateModel, LikeStatusEnum, LikeStatusModel } from "../../domain/interfaces/like-status.interface";
import { ObjectId } from "mongodb";

export class LikeStatusCommandRepository extends BaseCommandRepository<LikeStatusModel, LikeStatusCreateModel> {
    constructor() {
        super('commentLikeStatus');
    }

    async findAndUpdateStatus(userId: string, commentId: string, status: LikeStatusEnum): Promise<boolean> {
        this.checkInit();

        const now = new Date().toISOString();

        try {
            const existingStatus = await this.collection.findOne({ userId, commentId });

            if (existingStatus) {
                const result = await this.collection.updateOne(
                    { userId, commentId },
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
                    commentId,
                    status
                });
                return true;
            }
        } catch (error) {
            console.error("Error updating like status:", error);
            return false;
        }
    }

    async create(data: LikeStatusCreateModel): Promise<string> {
        this.checkInit();

        const now = new Date().toISOString();

        const likeStatusModel: LikeStatusModel = {
            _id: new ObjectId(),
            userId: data.userId,
            commentId: data.commentId,
            status: data.status,
            createdAt: now,
            updatedAt: now
        };

        await this.collection.insertOne(likeStatusModel);
        return likeStatusModel._id.toString();
    }
}