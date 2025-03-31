import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import {LikeStatusEnum} from "../../../comments/domain/interfaces/like-status.interface";
import {PostLikeStatusModel} from "../../domain/interfaces/post-like-status.interface";
import {ObjectId} from "mongodb";

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
        this.checkInit();

        try {
            console.log(`Updating status for userId=${userId}, postId=${postId}, status=${status}`);

            const now = new Date().toISOString();
            const existingRecord = await this.collection.findOne({ userId, postId });

            if (existingRecord) {
                console.log(`Found existing record with status ${existingRecord.status}`);
                const result = await this.collection.updateOne(
                    { userId, postId },
                    { $set: { status, updatedAt: now } }
                );

                console.log(`Update result: ${result.modifiedCount > 0 ? 'success' : 'failure'}`);
                return result.modifiedCount > 0;
            } else {
                console.log(`No existing record found, creating new`);
                const newRecord: PostLikeStatusModel = {
                    _id: new ObjectId(),
                    userId,
                    userLogin: userLogin || 'unknown',
                    postId,
                    status,
                    createdAt: now,
                    updatedAt: now
                };

                await this.collection.insertOne(newRecord);
                console.log(`New record created`);
                return true;
            }
        } catch (error) {
            console.error(`Error updating like status: ${error}`);
            return false;
        }
    }
}