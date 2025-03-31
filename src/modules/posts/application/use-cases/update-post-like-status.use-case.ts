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
        userLogin: string,
        dto: LikeStatusUpdateDTO
    ): Promise<Result<void>> {
        try {
            console.log(`[UpdatePostLikeStatusUseCase] Start: postId=${postId}, userId=${userId}, userLogin=${userLogin}, status=${dto.likeStatus}`);

            // 1. Check if post exists (returns Result.fail('Post not found'))
            const post = await this.postsQueryRepository.findById(postId);
            if (!post) {
                console.log(`[UpdatePostLikeStatusUseCase] Post not found: ${postId}`);
                return Result.fail('Post not found'); // Controller handles this -> 404
            }
            console.log(`[UpdatePostLikeStatusUseCase] Post found: ${postId}`);

            // 2. Validate status value (returns Result.fail({ errorsMessages: [...] }))
            const validStatuses: LikeStatusEnum[] = ['None', 'Like', 'Dislike'];
            if (!dto.likeStatus || !validStatuses.includes(dto.likeStatus as LikeStatusEnum)) {
                console.log(`[UpdatePostLikeStatusUseCase] Invalid likeStatus provided: ${dto.likeStatus}`);
                return Result.fail({
                    errorsMessages: [{
                        message: "Invalid like status. Should be 'None', 'Like', or 'Dislike'",
                        field: "likeStatus"
                    }]
                }); // Controller handles this -> 400
            }
            console.log(`[UpdatePostLikeStatusUseCase] Like status validation passed: ${dto.likeStatus}`);

            // 3. Attempt to update status in database
            console.log(`[UpdatePostLikeStatusUseCase] Calling repository to update/create status...`);
            const updated = await this.postLikeStatusCommandRepository.findAndUpdateStatus(
                userId,
                postId,
                userLogin,
                dto.likeStatus as LikeStatusEnum
            );

            // 4. Handle repository result
            if (!updated) {
                // Repository returned false, indicating an internal error (logged there)
                console.error(`[UpdatePostLikeStatusUseCase] Repository returned false for postId=${postId}, userId=${userId}. Assuming DB error.`);
                // *** ENSURE THIS RETURNS THE EXPECTED OBJECT FORMAT ***
                return Result.fail({
                    errorsMessages: [{
                        message: "Error processing like status update", // Revert to original message if tests expect it
                        field: "likeStatus" // Revert to original field
                    }]
                }); // Controller should handle this -> 400
            }

            console.log(`[UpdatePostLikeStatusUseCase] Successfully processed like status update for postId=${postId}, userId=${userId}`);
            return Result.ok(); // Return 204 in controller

        } catch (error) {
            console.error(`[UpdatePostLikeStatusUseCase] Unexpected exception: postId=${postId}, userId=${userId}`, error);
            console.error(error.stack);

            // *** ENSURE THIS RETURNS THE EXPECTED OBJECT FORMAT ***
            return Result.fail({
                errorsMessages: [{
                    message: "An unexpected error occurred", // Simpler message
                    field: "exception" // Keep field distinct if possible
                }]
            }); // Controller should handle this -> 400
        }
    }
}