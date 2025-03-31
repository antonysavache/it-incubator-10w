// src/modules/posts/application/use-cases/update-post-like-status.use-case.ts

import { Result } from "../../../../shared/infrastructures/result";
import { PostsQueryRepository } from "../../infrastructure/repositories/posts-query.repository";
import { PostLikeStatusCommandRepository } from "../../infrastructure/repositories/post-like-status-command.repository";
import { PostLikeStatusQueryRepository } from "../../infrastructure/repositories/post-like-status-query.repository";
import { LikeStatusEnum, LikeStatusUpdateDTO } from "../../../comments/domain/interfaces/like-status.interface";

export class UpdatePostLikeStatusUseCase {
    constructor(
        private postsQueryRepository: PostsQueryRepository,
        private postLikeStatusCommandRepository: PostLikeStatusCommandRepository,
        private postLikeStatusQueryRepository: PostLikeStatusQueryRepository
    ) {}

    async execute(
        postId: string,
        userId: string,
        userLogin: string, // Added userLogin
        dto: LikeStatusUpdateDTO
    ): Promise<Result<void>> {
        try {
            console.log(`[UpdatePostLikeStatusUseCase] Start: postId=${postId}, userId=${userId}, userLogin=${userLogin}, status=${dto.likeStatus}`);

            // 1. Check if post exists
            const post = await this.postsQueryRepository.findById(postId);
            if (!post) {
                console.log(`[UpdatePostLikeStatusUseCase] Post not found: ${postId}`);
                return Result.fail('Post not found'); // Return 404 in controller
            }
            console.log(`[UpdatePostLikeStatusUseCase] Post found: ${postId}`);

            // 2. Validate status value
            const validStatuses: LikeStatusEnum[] = ['None', 'Like', 'Dislike'];
            if (!dto.likeStatus || !validStatuses.includes(dto.likeStatus as LikeStatusEnum)) {
                console.log(`[UpdatePostLikeStatusUseCase] Invalid likeStatus provided: ${dto.likeStatus}`);
                // Return 400 in controller with validation error
                return Result.fail({
                    errorsMessages: [{
                        message: "Invalid like status. Should be 'None', 'Like', or 'Dislike'",
                        field: "likeStatus"
                    }]
                });
            }
            console.log(`[UpdatePostLikeStatusUseCase] Like status validation passed: ${dto.likeStatus}`);

            // 3. Attempt to update status in database (includes check for existing status)
            console.log(`[UpdatePostLikeStatusUseCase] Calling repository to update/create status...`);
            const updated = await this.postLikeStatusCommandRepository.findAndUpdateStatus(
                userId,
                postId,
                userLogin, // Pass userLogin here
                dto.likeStatus as LikeStatusEnum
            );

            // 4. Handle repository result
            if (!updated) {
                // This usually means a database error occurred, logged in the repo
                console.error(`[UpdatePostLikeStatusUseCase] Repository failed to update like status for postId=${postId}, userId=${userId}`);
                // Return 400 in controller, as it's an internal processing error, not a validation one
                return Result.fail({
                    errorsMessages: [{
                        message: "Error processing like status update", // Keep generic for client
                        field: "likeStatus" // Or maybe 'none' if it's a general DB issue
                    }]
                });
            }

            console.log(`[UpdatePostLikeStatusUseCase] Successfully processed like status update for postId=${postId}, userId=${userId}`);
            return Result.ok(); // Return 204 in controller

        } catch (error) {
            // Catch unexpected errors
            console.error(`[UpdatePostLikeStatusUseCase] Unexpected exception: postId=${postId}, userId=${userId}`, error);
            console.error(error.stack); // Log stack trace

            // Return 400 or 500 - 400 might align better with the current test expectation
            return Result.fail({
                errorsMessages: [{
                    message: "An unexpected error occurred while processing the like status.", // Keep generic
                    field: "none" // Indicate general failure
                }]
            });
        }
    }
}