import { ObjectId } from "mongodb";
import { CommentContent } from "../../../shared/value-objects/comment-content.value-object";
import { Result } from "../../../shared/infrastructures/result";
import { CommentDatabaseModel, CommentViewModel } from "./interfaces/comment.interface";

export class CommentEntity {
    private constructor(
        private readonly id: ObjectId,
        private readonly postId: string,
        private content: CommentContent,
        private readonly userId: string,
        private readonly userLogin: string,
        private readonly createdAt: string
    ) {}

    static create(
        postId: string,
        content: string,
        userId: string,
        userLogin: string
    ): Result<CommentEntity> {
        const contentResult = CommentContent.create(content);
        if (contentResult.isFailure()) {
            return Result.fail(contentResult.getError());
        }

        return Result.ok(new CommentEntity(
            new ObjectId(),
            postId,
            contentResult.getValue(),
            userId,
            userLogin,
            new Date().toISOString()
        ));
    }

    toDatabaseModel(): CommentDatabaseModel {
        return {
            _id: this.id,
            content: this.content.getValue(),
            userId: this.userId,
            userLogin: this.userLogin,
            postId: this.postId,
            createdAt: this.createdAt
        };
    }

    toViewModel(): CommentViewModel {
        return {
            id: this.id.toString(),
            content: this.content.getValue(),
            commentatorInfo: {
                userId: this.userId,
                userLogin: this.userLogin
            },
            createdAt: this.createdAt
        };
    }

    getUserId(): string {
        return this.userId;
    }
}