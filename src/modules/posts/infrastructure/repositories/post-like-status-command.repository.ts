import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { LikeStatusEnum } from "../../../comments/domain/interfaces/like-status.interface";
import { PostLikeStatusCreateModel, PostLikeStatusModel } from "../../domain/interfaces/post-like-status.interface"; // Ensure CreateModel is imported
import { ObjectId } from "mongodb";

export class PostLikeStatusCommandRepository extends BaseCommandRepository<PostLikeStatusModel, PostLikeStatusCreateModel> {
    constructor() {
        super('postLikeStatus');
    }

    // Explicitly define the create method for clarity and specific logic if needed
    async create(data: PostLikeStatusCreateModel): Promise<string> {
        this.checkInit();
        const now = new Date().toISOString();
        const newRecord: PostLikeStatusModel = {
            _id: new ObjectId(),
            userId: data.userId,
            userLogin: data.userLogin, // Ensure userLogin is passed in
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
            console.error(`[PostLikeStatusRepo] Error creating new record:`, error);
            // Re-throw or handle error appropriately, maybe return null or throw specific error
            throw new Error(`Failed to create post like status: ${error.message}`);
        }
    }


    async findAndUpdateStatus(userId: string, postId: string, userLogin: string, status: LikeStatusEnum): Promise<boolean> {
        this.checkInit();

        try {
            console.log(`[PostLikeStatusRepo] Updating status for userId=${userId}, postId=${postId}, status=${status}`);

            const now = new Date().toISOString();
            const existingRecord = await this.collection.findOne({ userId, postId });

            if (existingRecord) {
                console.log(`[PostLikeStatusRepo] Found existing record with status ${existingRecord.status}`);
                // Only update if the status is actually different
                if (existingRecord.status === status) {
                    console.log(`[PostLikeStatusRepo] Status unchanged (${status}), no update needed.`);
                    return true; // Indicate success as no change was required
                }
                const result = await this.collection.updateOne(
                    { _id: existingRecord._id }, // Use _id for update reliability
                    { $set: { status, updatedAt: now } }
                );

                console.log(`[PostLikeStatusRepo] Update result: ${result.modifiedCount > 0 ? 'success' : 'no changes needed'}`);
                // Return true if modified or if the status was already correct
                return result.modifiedCount > 0 || result.matchedCount > 0;
            } else {
                console.log(`[PostLikeStatusRepo] No existing record found, creating new.`);
                // Call the explicitly defined create method
                await this.create({
                    userId,
                    userLogin, // Pass userLogin here
                    postId,
                    status,
                });
                console.log(`[PostLikeStatusRepo] New record created successfully.`);
                return true;
            }
        } catch (error) {
            // Add more detailed error logging
            console.error(`[PostLikeStatusRepo] Error in findAndUpdateStatus for postId=${postId}, userId=${userId}:`, error);
            console.error(error.stack); // Log stack trace
            return false; // Return false on error
        }
    }
}