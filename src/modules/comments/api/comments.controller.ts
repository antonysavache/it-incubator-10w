import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { GetCommentsUseCase } from "../application/use-cases/get-comments.use-case";
import { CreateCommentUseCase } from "../application/use-cases/create-comment.use-case";
import { UpdateCommentUseCase } from "../application/use-cases/update-comment.use-case";
import { DeleteCommentUseCase } from "../application/use-cases/delete-comment.use-case";
import { GetCommentUseCase } from "../application/use-cases/get-comment.use-case";
import { UpdateLikeStatusUseCase } from "../application/use-cases/update-like-status.use-case";
import { RequestWithUser } from "../../../shared/types/express";
import { QueryParams } from '../../../shared/models/common.model';
import { LikeStatusUpdateDTO } from '../domain/interfaces/like-status.interface';
import {SETTINGS} from "../../../configs/settings";

interface CommentBodyModel {
    content: string;
}

export class CommentsController {
    constructor(
        private getCommentsUseCase: GetCommentsUseCase,
        private createCommentUseCase: CreateCommentUseCase,
        private updateCommentUseCase: UpdateCommentUseCase,
        private deleteCommentUseCase: DeleteCommentUseCase,
        private getCommentUseCase: GetCommentUseCase,
        private updateLikeStatusUseCase: UpdateLikeStatusUseCase,
    ) {}

    getComments = async (req: Request<{ postId: string }, {}, {}, QueryParams>, res: Response) => {
        // Extract userId from req.user if it exists (handles both authenticated and unauthenticated requests)
        const userId = req['user']?.id || (req as any).user?.id;

        const result = await this.getCommentsUseCase.execute(
            req.params.postId,
            req.query.sortBy,
            req.query.sortDirection,
            req.query.pageNumber,
            req.query.pageSize,
            userId
        );

        if (result.isFailure()) {
            return res.sendStatus(404);
        }

        return res.status(200).json(result.getValue());
    }

    createComment = async (req: RequestWithUser<{ postId: string }, CommentBodyModel>, res: Response) => {
        const result = await this.createCommentUseCase.execute(
            req.params.postId,
            req.body.content,
            req.user.id,
            req.user.login
        );

        if (result.isFailure()) {
            const error = result.getError();
            if (error === 'Post not found') {
                return res.sendStatus(404);
            }
            if (typeof error === 'string') {
                return res.status(400).json({
                    errorsMessages: [{ message: error, field: 'content' }]
                });
            }
            return res.status(400).json(error);
        }

        return res.status(201).json(result.getValue());
    }

    getComment = async (req: Request<{ commentId: string }>, res: Response) => {
        let userId = req['user']?.id || (req as any).user?.id;

        if (!userId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string };
                userId = payload.userId;
                console.log(`Extracted userId=${userId} directly from token`);
            } catch (e) {
                console.error('Error extracting userId from token:', e);
            }
        }

        console.log(`GetComment with userId=${userId}, commentId=${req.params.commentId}`);

        const result = await this.getCommentUseCase.execute(req.params.commentId, userId);
        if (result.isFailure()) {
            return res.sendStatus(404);
        }

        return res.status(200).json(result.getValue());
    }

    updateComment = async (req: RequestWithUser<{ commentId: string }, CommentBodyModel>, res: Response) => {
        const result = await this.updateCommentUseCase.execute(
            req.params.commentId,
            req.user.id,
            req.body.content
        );

        if (result.isFailure()) {
            const error = result.getError();
            if (error === 'Comment not found') {
                return res.sendStatus(404);
            }
            if (error === 'Forbidden') {
                return res.sendStatus(403);
            }
            if (typeof error === 'string') {
                return res.status(400).json({
                    errorsMessages: [{ message: error, field: 'content' }]
                });
            }
            return res.status(400).json(error);
        }

        return res.sendStatus(204);
    }

    deleteComment = async (req: RequestWithUser<{ commentId: string }>, res: Response) => {
        const result = await this.deleteCommentUseCase.execute(
            req.params.commentId,
            req.user.id
        );

        if (result.isFailure()) {
            const error = result.getError();
            if (error === 'Comment not found') {
                return res.sendStatus(404);
            }
            if (error === 'Forbidden') {
                return res.sendStatus(403);
            }
            return res.sendStatus(400);
        }

        return res.sendStatus(204);
    }

    updateLikeStatus = async (req: RequestWithUser<{ commentId: string }, LikeStatusUpdateDTO>, res: Response) => {
        console.log(`UpdateLikeStatus: commentId=${req.params.commentId}, userId=${req.user.id}, likeStatus=${req.body.likeStatus}`);

        const result = await this.updateLikeStatusUseCase.execute(
            req.params.commentId,
            req.user.id,
            req.body
        );

        if (result.isFailure()) {
            console.log(`Error updating like status:`, result.getError());
        } else {
            console.log(`Like status updated successfully`);
        }

        if (result.isFailure()) {
            const error = result.getError();

            if (error === 'Comment not found') {
                return res.sendStatus(404);
            }

            if (typeof error === 'object' && 'errorsMessages' in error) {
                return res.status(400).json(error);
            }

            return res.status(400).json({
                errorsMessages: [{ message: error as string, field: 'likeStatus' }]
            });
        }

        return res.sendStatus(204);
    }
}