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
            console.log(`UpdatePostLikeStatusUseCase executing with postId=${postId}, userId=${userId}, userLogin=${userLogin}, status=${dto.likeStatus}`);

            // Guard conditions
            if (!postId || !userId) {
                console.error('Missing required params: postId or userId');
                return Result.fail('Missing required parameters');
            }

            // Validate like status
            const validStatuses: LikeStatusEnum[] = ['None', 'Like', 'Dislike'];
            if (!dto.likeStatus || !validStatuses.includes(dto.likeStatus as LikeStatusEnum)) {
                console.error(`Invalid like status: ${dto.likeStatus}`);
                return Result.fail({
                    errorsMessages: [{
                        message: "Invalid like status. Should be 'None', 'Like', or 'Dislike'",
                        field: "likeStatus"
                    }]
                });
            }

            // Check if post exists
            const post = await this.postsQueryRepository.findById(postId);
            if (!post) {
                console.error(`Post with id=${postId} not found`);
                return Result.fail('Post not found');
            }

            // Get current like status
            const currentStatus = await this.postLikeStatusQueryRepository.getUserStatus(postId, userId);
            console.log(`Current like status: ${currentStatus}`);

            // Skip update if status hasn't changed
            if (currentStatus === dto.likeStatus) {
                console.log(`Status unchanged, skipping update`);
                return Result.ok();
            }

            // Update the like status
            const updated = await this.postLikeStatusCommandRepository.findAndUpdateStatus(
                userId,
                postId,
                userLogin || 'unknown',
                dto.likeStatus as LikeStatusEnum
            );

            if (!updated) {
                console.error('Failed to update like status');
                return Result.fail('Failed to update like status');
            }

            console.log(`Like status updated successfully to ${dto.likeStatus}`);
            return Result.ok();
        } catch (error) {
            console.error('Error in UpdatePostLikeStatusUseCase:', error);
            return Result.fail('An unexpected error occurred');
        }
    }
}