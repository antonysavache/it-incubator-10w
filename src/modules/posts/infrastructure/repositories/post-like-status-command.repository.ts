// src/modules/posts/infrastructure/repositories/post-like-status-command.repository.ts

import { Collection, ObjectId, MongoError } from 'mongodb';
import { getDatabase } from '../../../../shared/infrastructures/db/mongo-db'; // Adjust path if needed
import { LikeStatusEnum } from '../../../comments/domain/interfaces/like-status.interface'; // Adjust path if needed
import { PostLikeStatusCreateModel, PostLikeStatusModel } from '../../domain/interfaces/post-like-status.interface'; // Adjust path if needed
import { Result, ErrorType } from '../../../../shared/infrastructures/result'; // Import Result and ErrorType

// Define a more specific error structure compatible with ErrorType
type RepoErrorPayload = { errorsMessages: { message: string, field: string, code?: number | string }[] };

export class PostLikeStatusCommandRepository {
    private _collection: Collection<PostLikeStatusModel> | null = null;
    private readonly collectionName = 'postLikeStatus';

    private async getCollection(): Promise<Collection<PostLikeStatusModel>> {
        if (!this._collection) {
            try {
                const db = getDatabase();
                this._collection = db.collection<PostLikeStatusModel>(this.collectionName);
            } catch (error) {
                console.error(`[${this.collectionName}Repo] Error getting collection:`, error);
                // Throwing here ensures operations fail early if collection can't be obtained
                throw new Error(`Failed to initialize repository for ${this.collectionName}`);
            }
        }
        // Added check after potential initialization
        if (!this._collection) {
            throw new Error(`Collection ${this.collectionName} not initialized correctly.`);
        }
        return this._collection;
    }

    /**
     * Creates a new like status record.
     * Returns Result<string (new document ID)>
     */
    async create(data: PostLikeStatusCreateModel): Promise<Result<string>> {
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
            const collection = await this.getCollection();
            const result = await collection.insertOne(newRecord);
            console.log(`[${this.collectionName}Repo] Created new record with id: ${result.insertedId}`);
            return Result.ok(result.insertedId.toString());
        } catch (error) {
            const errorMessage = `Database insert failed in ${this.collectionName}Repo`;
            console.error(`[${this.collectionName}Repo] ${errorMessage}:`, error);
            const errorPayload: RepoErrorPayload = { errorsMessages: [{ message: errorMessage, field: 'database' }] };
            if (error instanceof MongoError) {
                errorPayload.errorsMessages[0].code = error.code;
                errorPayload.errorsMessages[0].message += `: ${error.message}`; // Add Mongo error message
            }
            // Ensure the payload matches ErrorType structure
            return Result.fail(errorPayload);
        }
    }

    /**
     * Finds an existing like status record for a user/post combination and updates it,
     * or creates a new one if it doesn't exist.
     * Returns Result<void>
     */
    async findAndUpdateStatus(
        userId: string,
        postId: string,
        userLogin: string,
        status: LikeStatusEnum
    ): Promise<Result<void>> { // Return Promise<Result<void>>
        try {
            console.log(`[${this.collectionName}Repo] Updating status for userId=${userId}, postId=${postId}, status=${status}`);

            if (!ObjectId.isValid(postId)) {
                const errorMsg = `Invalid postId format: ${postId}`;
                console.error(`[${this.collectionName}Repo] ${errorMsg}`);
                // Correctly format the error payload
                return Result.fail({ errorsMessages: [{ message: errorMsg, field: 'postId' }] });
            }

            const collection = await this.getCollection();
            const now = new Date().toISOString();

            let existingRecord: PostLikeStatusModel | null = null;
            try {
                existingRecord = await collection.findOne({ userId, postId });
            } catch (findError) {
                const errorMsg = `Error finding existing record for userId=${userId}, postId=${postId}`;
                console.error(`[${this.collectionName}Repo] ${errorMsg}:`, findError);
                const errorPayload: RepoErrorPayload = { errorsMessages: [{ message: errorMsg, field: 'database' }] };
                if (findError instanceof MongoError) errorPayload.errorsMessages[0].code = findError.code;
                return Result.fail(errorPayload);
            }

            if (existingRecord) {
                console.log(`[${this.collectionName}Repo] Found existing record with status ${existingRecord.status}`);
                if (existingRecord.status === status) {
                    console.log(`[${this.collectionName}Repo] Status unchanged (${status}), no database operation needed.`);
                    return Result.ok();
                }

                try {
                    const result = await collection.updateOne(
                        { _id: existingRecord._id },
                        { $set: { status, updatedAt: now } }
                    );
                    console.log(`[${this.collectionName}Repo] Update result: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
                    if (result.matchedCount === 0) {
                        const errorMsg = "Failed to find the record for update after initially finding it.";
                        console.warn(`[${this.collectionName}Repo] ${errorMsg}: _id=${existingRecord._id}`);
                        return Result.fail({ errorsMessages: [{ message: errorMsg, field: 'database' }] });
                    }
                    return Result.ok();
                } catch (updateError) {
                    const errorMsg = `Error updating record with _id=${existingRecord._id}`;
                    console.error(`[${this.collectionName}Repo] ${errorMsg}:`, updateError);
                    const errorPayload: RepoErrorPayload = { errorsMessages: [{ message: errorMsg, field: 'database' }] };
                    if (updateError instanceof MongoError) errorPayload.errorsMessages[0].code = updateError.code;
                    return Result.fail(errorPayload);
                }

            } else {
                console.log(`[${this.collectionName}Repo] No existing record found, creating new.`);
                const createResult = await this.create({
                    userId,
                    userLogin,
                    postId,
                    status,
                });

                // Check if create failed and propagate the failure
                if (createResult.isFailure()) {
                    return Result.fail(createResult.getError()); // Propagate the error object
                }

                console.log(`[${this.collectionName}Repo] New record created successfully.`);
                return Result.ok();
            }
        } catch (error) {
            // Catch unexpected errors
            const errorMsg = `Unexpected error in findAndUpdateStatus for postId=${postId}, userId=${userId}`;
            console.error(`[${this.collectionName}Repo] ${errorMsg}:`, error);
            const errorPayload: RepoErrorPayload = { errorsMessages: [{ message: errorMsg, field: 'unexpected' }] };
            if (error instanceof MongoError) errorPayload.errorsMessages[0].code = error.code;
            else if (error instanceof Error) console.error(error.stack);
            return Result.fail(errorPayload);
        }
    }

    // Optional: Add deleteAll method if needed for testing
    async deleteAll(): Promise<Result<void>> {
        try {
            const collection = await this.getCollection();
            await collection.deleteMany({});
            console.log(`[${this.collectionName}Repo] All documents deleted.`);
            return Result.ok();
        } catch (error) {
            const errorMessage = `Database deleteMany failed in ${this.collectionName}Repo`;
            console.error(`[${this.collectionName}Repo] ${errorMessage}:`, error);
            const errorPayload: RepoErrorPayload = { errorsMessages: [{ message: errorMessage, field: 'database' }] };
            if (error instanceof MongoError) errorPayload.errorsMessages[0].code = error.code;
            return Result.fail(errorPayload);
        }
    }
}