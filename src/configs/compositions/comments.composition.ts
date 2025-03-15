import { CommentsQueryRepository } from "../../modules/comments/infrastructure/repositories/comments-query.repository";
import { CommentsCommandRepository } from "../../modules/comments/infrastructure/repositories/comments-command.repository";
import { CreateCommentUseCase } from "../../modules/comments/application/use-cases/create-comment.use-case";
import { GetCommentsUseCase } from "../../modules/comments/application/use-cases/get-comments.use-case";
import { UpdateCommentUseCase } from "../../modules/comments/application/use-cases/update-comment.use-case";
import { DeleteCommentUseCase } from "../../modules/comments/application/use-cases/delete-comment.use-case";
import { GetCommentUseCase } from "../../modules/comments/application/use-cases/get-comment.use-case";
import { CommentsController } from "../../modules/comments/api/comments.controller";
import {commentsCommandRepository, commentsQueryRepository, postsQueryRepository} from "./repositories";

export const createCommentUseCase = new CreateCommentUseCase(
    commentsCommandRepository,
    commentsQueryRepository,
    postsQueryRepository
);

export const getCommentsUseCase = new GetCommentsUseCase(
    commentsQueryRepository,
    postsQueryRepository
);

export const getCommentUseCase = new GetCommentUseCase(
    commentsQueryRepository
);

export const updateCommentUseCase = new UpdateCommentUseCase(
    commentsCommandRepository,
    commentsQueryRepository
);

export const deleteCommentUseCase = new DeleteCommentUseCase(
    commentsCommandRepository,
    commentsQueryRepository
);

export const commentsController = new CommentsController(
    getCommentsUseCase,
    createCommentUseCase,
    updateCommentUseCase,
    deleteCommentUseCase,
    getCommentUseCase
);