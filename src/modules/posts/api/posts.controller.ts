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
            console.log(`Update like status request for postId=${req.params.postId}, body=`, req.body);

            // Extract user info from JWT token if not provided by middleware
            let userId = req.user?.id;
            let userLogin = req.user?.login;

            if (!userId && req.headers.authorization) {
                try {
                    const token = req.headers.authorization.split(' ')[1];
                    const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as any;
                    userId = payload.userId;
                    userLogin = payload.login || 'unknown';
                    console.log(`Extracted user from token: userId=${userId}, login=${userLogin}`);
                } catch (err) {
                    console.error('Failed to extract user from token:', err);
                    return res.sendStatus(401);
                }
            }

            if (!userId) {
                console.error('Missing userId for like status update');
                return res.sendStatus(401);
            }

            const result = await this.updatePostLikeStatusUseCase.execute(
                req.params.postId,
                userId,
                userLogin || 'unknown',
                req.body
            );

            if (result.isFailure()) {
                const error = result.getError();
                console.log(`Error updating like status:`, error); // Check this log if possible

                if (error === 'Post not found') { // Error is NOT this string
                    return res.sendStatus(404);
                }

                // Error IS likely NOT this object format based on previous results
                if (typeof error === 'object' && 'errorsMessages' in error) {
                    return res.status(400).json(error);
                }

                // *** THIS PART MATCHES THE CURRENT ERROR OUTPUT ***
                return res.status(400).json({
                    errorsMessages: [{ message: error as string, field: 'likeStatus' }] // <--- This structure!
                });
            }

            return res.sendStatus(204);
        } catch (error) {
            console.error('Error in updateLikeStatus:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}