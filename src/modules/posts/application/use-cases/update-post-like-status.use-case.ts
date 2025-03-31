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
        userLogin: string | undefined | null, // Accept potentially undefined/null
        dto: LikeStatusUpdateDTO
    ): Promise<Result<void>> {
        try {
            // *** MODIFIED: More robust fallback for userLogin ***
            const actualUserLogin = (userLogin && userLogin.trim() !== '') ? userLogin : `user_${userId.substring(0, 4)}`;
            // If login is empty, null, or undefined, create a fallback like "user_abcd"

            console.log(`[UpdatePostLikeStatusUseCase] Start: postId=${postId}, userId=${userId}, userLogin='${actualUserLogin}', status=${dto.likeStatus}`);

            // 1. Check if post exists
            const post = await this.postsQueryRepository.findById(postId);
            if (!post) {
                console.log(`[UpdatePostLikeStatusUseCase] Post not found: ${postId}`);
                return Result.fail('Post not found');
            }
            console.log(`[UpdatePostLikeStatusUseCase] Post found: ${postId}`);

            // 2. Validate status value
            const validStatuses: LikeStatusEnum[] = ['None', 'Like', 'Dislike'];
            if (!dto.likeStatus || !validStatuses.includes(dto.likeStatus as LikeStatusEnum)) {
                console.log(`[UpdatePostLikeStatusUseCase] Invalid likeStatus provided: ${dto.likeStatus}`);
                return Result.fail({
                    errorsMessages: [{
                        message: "Invalid like status. Should be 'None', 'Like', or 'Dislike'",
                        field: "likeStatus"
                    }]
                });
            }
            console.log(`[UpdatePostLikeStatusUseCase] Like status validation passed: ${dto.likeStatus}`);

            // 3. Attempt to update status in database
            console.log(`[UpdatePostLikeStatusUseCase] Calling repository with userLogin='${actualUserLogin}'...`);
            const updated = await this.postLikeStatusCommandRepository.findAndUpdateStatus(
                userId,
                postId,
                actualUserLogin, // Use the guaranteed non-empty login
                dto.likeStatus as LikeStatusEnum
            );

            // 4. Handle repository result
            if (!updated) {
                console.error(`[UpdatePostLikeStatusUseCase] Repository returned false for postId=${postId}, userId=${userId}.`);
                return Result.fail({
                    errorsMessages: [{
                        message: "Error processing like status update",
                        field: "likeStatus"
                    }]
                });
            }

            console.log(`[UpdatePostLikeStatusUseCase] Successfully processed like status update for postId=${postId}, userId=${userId}`);
            return Result.ok();

        } catch (error) {
            console.error(`[UpdatePostLikeStatusUseCase] Unexpected exception: postId=${postId}, userId=${userId}`, error);
            console.error(error.stack);
            return Result.fail({
                errorsMessages: [{
                    message: "An unexpected error occurred",
                    field: "exception"
                }]
            });
        }
    }
}