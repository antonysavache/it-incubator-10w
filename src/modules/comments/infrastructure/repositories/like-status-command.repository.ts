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

        const result = await this.collection.findOneAndUpdate(
            { userId, commentId },
            {
                $set: {
                    status,
                    updatedAt: now
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            await this.create({
                userId,
                commentId,
                status
            });
        }

        return true;
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