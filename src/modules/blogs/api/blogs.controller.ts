import { Request, Response } from 'express';
import { GetBlogsUseCase } from '../application/use-cases/get-blogs.use-case';
import { CreateBlogUseCase } from '../application/use-cases/create-blog.use-case';
import { GetBlogByIdUseCase } from '../application/use-cases/get-blog-by-id.use-case';
import { UpdateBlogUseCase } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from '../application/use-cases/delete-blog.use-case';
import { CreateBlogPostUseCase } from '../application/use-cases/create-blog-post.use-case';
import { GetBlogPostsUseCase } from '../application/use-cases/get-blog-posts.use-case';
import { QueryParams } from '../../../shared/models/common.model';
import { BlogCreateDTO } from '../domain/interfaces/blog.interface';
import { PostCreateDTO } from '../../posts/domain/interfaces/post.interface';
import {SETTINGS} from "../../../configs/settings";
import {JwtPayload} from "../../../shared/services/jwt.service";
import jwt from 'jsonwebtoken';


export class BlogsController {
    constructor(
        private getBlogsUseCase: GetBlogsUseCase,
        private createBlogUseCase: CreateBlogUseCase,
        private getBlogByIdUseCase: GetBlogByIdUseCase,
        private updateBlogUseCase: UpdateBlogUseCase,
        private deleteBlogUseCase: DeleteBlogUseCase,
        private createBlogPostUseCase: CreateBlogPostUseCase,
        private getBlogPostsUseCase: GetBlogPostsUseCase
    ) {}

    getBlogs = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
        const blogs = await this.getBlogsUseCase.execute(req.query);
        res.status(200).json(blogs);
    }

    getBlogById = async (req: Request<{ id: string }>, res: Response) => {
        const result = await this.getBlogByIdUseCase.execute(req.params.id);

        result.isFailure() ? res.sendStatus(404) :  res.status(200).json(result.getValue())
    }

    createBlog = async (req: Request<{}, {}, BlogCreateDTO>, res: Response) => {
        const result = await this.createBlogUseCase.execute(req.body);

        if (result.isFailure()) {
            res.status(400).json({
                errorsMessages: [{ message: result.getError(), field: 'none' }]
            });
        } else {
            res.status(201).json(result.getValue());
        }

    }

    updateBlog = async (req: Request<{ id: string }, {}, BlogCreateDTO>, res: Response) => {
        const result = await this.updateBlogUseCase.execute(req.params.id, req.body);

        result.isFailure() ? res.sendStatus(404) : res.sendStatus(204);
    }

    deleteBlog = async (req: Request<{ id: string }>, res: Response) => {
        const result = await this.deleteBlogUseCase.execute(req.params.id);

        result.isFailure() ? res.sendStatus(404) : res.sendStatus(204);
    }

    getBlogPosts = async (req: Request<{ id: string }, {}, {}, QueryParams>, res: Response) => {
        let userId: string | undefined = undefined;

        // **** START: ADD userId EXTRACTION LOGIC ****
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                // Use your JwtService if it handles verification errors appropriately
                // Or use jwt.verify directly
                const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as JwtPayload;
                if (payload && payload.userId) {
                    userId = payload.userId;
                    console.log(`[getBlogPosts] Extracted userId=${userId} from token.`);
                }
            } catch (e) {
                console.log('[getBlogPosts] Token verification failed or token invalid/expired.');
                // Don't fail the request, just proceed without userId for anonymous view
            }
        } else {
            console.log('[getBlogPosts] No authorization token found.');
        }
        // **** END: ADD userId EXTRACTION LOGIC ****

        // **** Pass the extracted userId (or undefined) to the use case ****
        const result = await this.getBlogPostsUseCase.execute(req.params.id, req.query, userId);

        if (result.isFailure()) {
            res.sendStatus(404); // Blog not found
        } else {
            res.status(200).json(result.getValue());
        }
    }

    createBlogPost = async (req: Request<{ id: string }, {}, PostCreateDTO>, res: Response) => {
        const { title, content, shortDescription } = req.body;

        const result = await this.createBlogPostUseCase.execute(
            req.params.id,
            { title, content, shortDescription }
        );

        if (result.isFailure()) {
            const error = result.getError();
            if (error === 'Blog not found') {
                res.sendStatus(404);
            } else {
                res.status(400).json({
                    errorsMessages: [{ message: error, field: 'none' }]
                });
            }
        } else {
            res.status(201).json(result.getValue());
        }
    }
}