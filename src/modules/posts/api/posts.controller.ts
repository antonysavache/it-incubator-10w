import { Request, Response } from 'express';
import { GetPostsUseCase } from "../application/use-cases/get-posts.use-case";
import { CreatePostUseCase } from "../application/use-cases/create-post.use-case";
import { GetPostByIdUseCase } from "../application/use-cases/get-post-by-id.use-case";
import { UpdatePostUseCase } from "../application/use-cases/update-post.use-case";
import { DeletePostUseCase } from "../application/use-cases/delete-post.use-case";
import { PostCreateDTO } from "../domain/interfaces/post.interface";
import { UpdatePostLikeStatusUseCase } from "../application/use-cases/update-post-like-status.use-case";
import { RequestWithUser } from "../../../shared/types/express";
import { LikeStatusUpdateDTO } from "../../comments/domain/interfaces/like-status.interface";
import jwt from 'jsonwebtoken';
import { SETTINGS } from "../../../configs/settings";

export class PostsController {
    constructor(
        private getPostsUseCase: GetPostsUseCase,
        private createPostUseCase: CreatePostUseCase,
        private getPostByIdUseCase: GetPostByIdUseCase,
        private updatePostUseCase: UpdatePostUseCase,
        private deletePostUseCase: DeletePostUseCase,
        private updatePostLikeStatusUseCase: UpdatePostLikeStatusUseCase
    ) {}

    getPosts = async (req: Request, res: Response) => {
        // Extract userId if available
        let userId = req['user']?.id || (req as any).user?.id;

        // Try to extract from token if not provided by middleware
        if (!userId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string };
                userId = payload.userId;
            } catch (e) {
                // Ignore errors, userId will stay undefined
            }
        }

        const posts = await this.getPostsUseCase.execute(req.query, userId);
        res.status(200).json(posts);
    }

    createPost = async (req: Request<{}, {}, PostCreateDTO>, res: Response) => {
        const result = await this.createPostUseCase.execute(req.body);

        if (result.isFailure()) {
            res.status(400).json({
                errorsMessages: [{ message: result.getError(), field: 'none' }]
            });
        } else {
            res.status(201).json(result.getValue());
        }
    }

    getPostById = async (req: Request<{ id: string }>, res: Response) => {
        // Extract userId if available
        let userId = req['user']?.id || (req as any).user?.id;

        // Try to extract from token if not provided by middleware
        if (!userId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string };
                userId = payload.userId;
            } catch (e) {
                // Ignore errors, userId will stay undefined
            }
        }

        const result = await this.getPostByIdUseCase.execute(req.params.id, userId);
        result.isFailure() ? res.sendStatus(404) : res.status(200).json(result.getValue())
    }

    updatePost = async (req: Request<{ id: string }, {}, PostCreateDTO>, res: Response) => {
        const result = await this.updatePostUseCase.execute(req.params.id, req.body);

        result.isFailure() ? res.sendStatus(404) : res.sendStatus(204);
    }

    deletePost = async (req: Request<{ id: string }>, res: Response) => {
        const result = await this.deletePostUseCase.execute(req.params.id);

        result.isFailure() ? res.sendStatus(404) : res.sendStatus(204);
    }

    updateLikeStatus = async (req: RequestWithUser<{ postId: string }, LikeStatusUpdateDTO>, res: Response) => {
        console.log(`UpdateLikeStatus: postId=${req.params.postId}, userId=${req.user.id}, likeStatus=${req.body.likeStatus}`);

        const result = await this.updatePostLikeStatusUseCase.execute(
            req.params.postId,
            req.user.id,
            req.user.login,
            req.body
        );

        if (result.isFailure()) {
            console.log(`Error updating post like status:`, result.getError());
        } else {
            console.log(`Post like status updated successfully`);
        }

        if (result.isFailure()) {
            const error = result.getError();

            if (error === 'Post not found') {
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