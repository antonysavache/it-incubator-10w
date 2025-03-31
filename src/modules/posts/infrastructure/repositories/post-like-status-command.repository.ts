// src/modules/posts/infrastructure/repositories/post-like-status-command.repository.ts

import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { LikeStatusEnum } from "../../../comments/domain/interfaces/like-status.interface";
import { PostLikeStatusCreateModel, PostLikeStatusModel } from "../../domain/interfaces/post-like-status.interface";
import { ObjectId, MongoError } from "mongodb"; // Import MongoError

export class PostLikeStatusCommandRepository extends BaseCommandRepository<PostLikeStatusModel, PostLikeStatusCreateModel> {
    constructor() {
        super('postLikeStatus');
    }

    // Explicitly define the create method for clarity and specific logic if needed
    async create(data: PostLikeStatusCreateModel): Promise<string> {
        this.checkInit(); // Ensure collection is initialized
        const now = new Date().toISOString();
        const newRecord: PostLikeStatusModel = {
            _id: new ObjectId(),
            userId: data.userId,
            userLogin: data.userLogin,
            postId: data.postId,
            status: data.status,
            createdAt: now,
            updatedAt: now
        };

        try {
            const result = await this.collection.insertOne(newRecord);
            console.log(`[PostLikeStatusRepo] Created new record with id: ${result.insertedId}`);
            return result.insertedId.toString();
        } catch (error) {
            console.error(`[PostLikeStatusRepo] Error during insertOne:`, error);
            // Throw a more specific error
            throw new Error(`Database insert failed in PostLikeStatusRepo: ${error.message}`);
        }
    }


    async findAndUpdateStatus(userId: string, postId: string, userLogin: string, status: LikeStatusEnum): Promise<boolean> {
        // Add checkInit here as well for robustness
        try {
            this.checkInit();
        } catch (initError) {
            console.error(`[PostLikeStatusRepo] Repository not initialized:`, initError);
            return false; // Indicate failure if not initialized
        }


        try {
            console.log(`[PostLikeStatusRepo] Updating status for userId=${userId}, postId=${postId}, status=${status}`);

            // Validate ObjectIds before querying
            if (!ObjectId.isValid(postId)) {
                console.error(`[PostLikeStatusRepo] Invalid postId format: ${postId}`);
                return false; // Indicate failure due to invalid ID
            }
            // Assuming userId is validated elsewhere (e.g., JWT middleware)


            const now = new Date().toISOString();
            const existingRecord = await this.collection.findOne({ userId, postId });

            if (existingRecord) {
                console.log(`[PostLikeStatusRepo] Found existing record with status ${existingRecord.status}`);
                if (existingRecord.status === status) {
                    console.log(`[PostLikeStatusRepo] Status unchanged (${status}), no update needed.`);
                    return true;
                }
                const result = await this.collection.updateOne(
                    { _id: existingRecord._id },
                    { $set: { status, updatedAt: now } }
                );
                console.log(`[PostLikeStatusRepo] Update result: ${result.modifiedCount > 0 ? 'success' : 'no changes needed'}`);
                return result.modifiedCount > 0 || result.matchedCount > 0;
            } else {
                console.log(`[PostLikeStatusRepo] No existing record found, creating new.`);
                // Call the explicitly defined create method
                // Wrap create call in try-catch in case IT throws
                try {
                    await this.create({
                        userId,
                        userLogin,
                        postId,
                        status,
                    });
                    console.log(`[PostLikeStatusRepo] New record created successfully.`);
                    return true;
                } catch (createError) {
                    console.error(`[PostLikeStatusRepo] Error calling create method:`, createError);
                    return false; // Indicate failure if create throws
                }
            }
        } catch (error) {
            console.error(`[PostLikeStatusRepo] Error in findAndUpdateStatus for postId=${postId}, userId=${userId}:`, error);
            // Check if it's a MongoDB specific error
            if (error instanceof MongoError) {
                console.error(`[PostLikeStatusRepo] MongoDB Error Code: ${error.code}, Message: ${error.message}`);
            }
            console.error(error.stack);
            return false; // Indicate failure
        }
    }
}