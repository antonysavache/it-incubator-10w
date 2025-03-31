// src/modules/posts/api/posts.controller.ts
import { Request, Response } from 'express';
import { GetPostsUseCase } from "../application/use-cases/get-posts.use-case";
import { CreatePostUseCase } from "../application/use-cases/create-post.use-case";
import { GetPostByIdUseCase } from "../application/use-cases/get-post-by-id.use-case";
import { UpdatePostUseCase } from "../application/use-cases/update-post.use-case";
import { DeletePostUseCase } from "../application/use-cases/delete-post.use-case";
import { PostCreateDTO } from "../domain/interfaces/post.interface";
import { UpdatePostLikeStatusUseCase } from "../application/use-cases/update-post-like-status.use-case";
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
        try {
            // Extract userId if available
            let userId = undefined;

            // Try to extract from token if provided
            if (req.headers.authorization) {
                try {
                    const token = req.headers.authorization.split(' ')[1];
                    if (token) {
                        const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string };
                        if (payload && payload.userId) {
                            userId = payload.userId;
                        }
                    }
                } catch (e) {
                    // Ignore token errors for this endpoint
                }
            }

            const posts = await this.getPostsUseCase.execute(req.query, userId);
            res.status(200).json(posts);
        } catch (error) {
            console.error('Error in getPosts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    createPost = async (req: Request<{}, {}, PostCreateDTO>, res: Response) => {
        try {
            const result = await this.createPostUseCase.execute(req.body);

            if (result.isFailure()) {
                res.status(400).json({
                    errorsMessages: [{ message: result.getError(), field: 'none' }]
                });
            } else {
                res.status(201).json(result.getValue());
            }
        } catch (error) {
            console.error('Error in createPost:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    getPostById = async (req: Request<{ id: string }>, res: Response) => {
        try {
            // Extract userId if available
            let userId = undefined;

            if (req.headers.authorization) {
                try {
                    const token = req.headers.authorization.split(' ')[1];
                    if (token) {
                        const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string };
                        if (payload && payload.userId) {
                            userId = payload.userId;
                        }
                    }
                } catch (e) {
                    // Ignore token errors for this endpoint
                }
            }

            const result = await this.getPostByIdUseCase.execute(req.params.id, userId);
            if (result.isFailure()) {
                res.sendStatus(404);
            } else {
                res.status(200).json(result.getValue());
            }
        } catch (error) {
            console.error('Error in getPostById:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    updatePost = async (req: Request<{ id: string }, {}, PostCreateDTO>, res: Response) => {
        try {
            const result = await this.updatePostUseCase.execute(req.params.id, req.body);
            result.isFailure() ? res.sendStatus(404) : res.sendStatus(204);
        } catch (error) {
            console.error('Error in updatePost:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    deletePost = async (req: Request<{ id: string }>, res: Response) => {
        try {
            const result = await this.deletePostUseCase.execute(req.params.id);
            result.isFailure() ? res.sendStatus(404) : res.sendStatus(204);
        } catch (error) {
            console.error('Error in deletePost:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    updateLikeStatus = async (req: Request<{ postId: string }, {}, LikeStatusUpdateDTO>, res: Response) => {
        try {
            // Safely access user properties with fallbacks
            const userId = req['user']?.id || '';
            const userLogin = req['user']?.login || 'unknown';

            console.log(`Updating like status for postId=${req.params.postId}, userId=${userId}, status=${req.body.likeStatus}`);

            if (!userId) {
                console.error('Missing userId in request');
                return res.sendStatus(401);
            }

            const result = await this.updatePostLikeStatusUseCase.execute(
                req.params.postId,
                userId,
                userLogin,
                req.body
            );

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
        } catch (error) {
            console.error('Error in updateLikeStatus:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}