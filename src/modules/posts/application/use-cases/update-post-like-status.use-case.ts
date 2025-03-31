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
        const validStatuses: LikeStatusEnum[] = ['None', 'Like', 'Dislike'];
        if (!validStatuses.includes(dto.likeStatus as LikeStatusEnum)) {
            return Result.fail({
                errorsMessages: [{
                    message: "Invalid like status. Should be 'None', 'Like', or 'Dislike'",
                    field: "likeStatus"
                }]
            });
        }

        const post = await this.postsQueryRepository.findById(postId);
        if (!post) {
            return Result.fail('Post not found');
        }

        const currentStatus = await this.postLikeStatusQueryRepository.getUserStatus(postId, userId);

        if (currentStatus === dto.likeStatus) {
            // No need to update if status hasn't changed
            return Result.ok();
        }

        const updated = await this.postLikeStatusCommandRepository.findAndUpdateStatus(
            userId,
            postId,
            userLogin,
            dto.likeStatus as LikeStatusEnum
        );

        if (!updated) {
            return Result.fail('Failed to update like status');
        }

        return Result.ok();
    }
}