import { CommentsCommandRepository } from "../../infrastructure/repositories/comments-command.repository";
import { PostsQueryRepository } from "../../../posts/infrastructure/repositories/posts-query.repository";
import { Result } from "../../../../shared/infrastructures/result";
import { CommentViewModel } from "../../domain/interfaces/comment.interface";
import { CommentsQueryRepository } from "../../infrastructure/repositories/comments-query.repository";
import { CommentContent } from "../../../../shared/value-objects/comment-content.value-object";
import { ObjectId } from "mongodb";

export class CreateCommentUseCase {
    constructor(
        private commentsCommandRepository: CommentsCommandRepository,
        private commentsQueryRepository: CommentsQueryRepository,
        private postsQueryRepository: PostsQueryRepository
    ) {}

    async execute(
        postId: string,
        content: string,
        userId: string,
        userLogin: string
    ): Promise<Result<CommentViewModel>> {
        // Проверка content
        const contentResult = CommentContent.create(content);
        if (contentResult.isFailure()) {
            return Result.fail(contentResult.getError());
        }

        // Проверка существования поста
        const post = await this.postsQueryRepository.findById(postId);
        if (!post) {
            return Result.fail('Post not found');
        }

        // Убираем эту проверку, userLogin всегда будет передаваться из middleware
        // if (!userLogin) {
        //     return Result.fail({
        //         errorsMessages: [{ message: "User login is required", field: "content" }]
        //     });
        // }

        // Создаем комментарий
        const commentData = {
            _id: new ObjectId(),
            postId,
            content: contentResult.getValue().getValue(),
            userId,
            userLogin,
            createdAt: new Date().toISOString()
        };

        const id = await this.commentsCommandRepository.create(commentData);
        const comment = await this.commentsQueryRepository.findPublicById(id, userId);

        if (!comment) {
            return Result.fail('Failed to create comment');
        }

        return Result.ok(comment);
    }
}