import { Request, Response } from 'express';
import {GetPostsUseCase} from "../application/use-cases/get-posts.use-case";
import {CreatePostUseCase} from "../application/use-cases/create-post.use-case";
import {GetPostByIdUseCase} from "../application/use-cases/get-post-by-id.use-case";
import {UpdatePostUseCase} from "../application/use-cases/update-post.use-case";
import {DeletePostUseCase} from "../application/use-cases/delete-post.use-case";
import {PostCreateDTO} from "../domain/interfaces/post.interface";

export class PostsController {
    constructor(
        private getPostsUseCase: GetPostsUseCase,
        private createPostUseCase: CreatePostUseCase,
        private getPostByIdUseCase: GetPostByIdUseCase,
        private updatePostUseCase: UpdatePostUseCase,
        private deletePostUseCase: DeletePostUseCase
    ) {}

    getPosts = async (req: Request, res: Response) => {
        const posts = await this.getPostsUseCase.execute(req.query);
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
        const result = await this.getPostByIdUseCase.execute(req.params.id);
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
}