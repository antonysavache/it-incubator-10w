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
        console.log(`Executing post like status update: postId=${postId}, userId=${userId}, userLogin=${userLogin}, status=${dto.likeStatus}`);

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
        console.log(`Current like status for userId=${userId} is ${currentStatus}`);

        if (currentStatus === dto.likeStatus) {
            // No need to update if status hasn't changed
            console.log(`Status unchanged, skipping update: ${currentStatus}`);
            return Result.ok();
        }

        const updated = await this.postLikeStatusCommandRepository.findAndUpdateStatus(
            userId,
            postId,
            userLogin,
            dto.likeStatus as LikeStatusEnum
        );

        if (!updated) {
            console.error(`Failed to update post like status`);
            return Result.fail('Failed to update like status');
        }

        console.log(`Successfully updated post like status to ${dto.likeStatus}`);
        return Result.ok();
    }
}