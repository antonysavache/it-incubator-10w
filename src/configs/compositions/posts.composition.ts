import { GetPostsUseCase } from "../../modules/posts/application/use-cases/get-posts.use-case";
import { CreatePostUseCase } from "../../modules/posts/application/use-cases/create-post.use-case";
import { GetPostByIdUseCase } from "../../modules/posts/application/use-cases/get-post-by-id.use-case";
import { UpdatePostUseCase } from "../../modules/posts/application/use-cases/update-post.use-case";
import { DeletePostUseCase } from "../../modules/posts/application/use-cases/delete-post.use-case";
import { PostsController } from "../../modules/posts/api/posts.controller";
import { blogsQueryRepository, postsCommandRepository, postsQueryRepository } from "./repositories";
import { UpdatePostLikeStatusUseCase } from "../../modules/posts/application/use-cases/update-post-like-status.use-case";
import { PostLikeStatusCommandRepository } from "../../modules/posts/infrastructure/repositories/post-like-status-command.repository";
import { PostLikeStatusQueryRepository } from "../../modules/posts/infrastructure/repositories/post-like-status-query.repository";

// Create instances of new repositories
export const postLikeStatusCommandRepository = new PostLikeStatusCommandRepository();
export const postLikeStatusQueryRepository = new PostLikeStatusQueryRepository();

// Use Cases
export const getPostsUseCase = new GetPostsUseCase(postsQueryRepository);
export const createPostUseCase = new CreatePostUseCase(blogsQueryRepository, postsCommandRepository);
export const getPostByIdUseCase = new GetPostByIdUseCase(postsQueryRepository);
export const updatePostUseCase = new UpdatePostUseCase(blogsQueryRepository, postsCommandRepository);
export const deletePostUseCase = new DeletePostUseCase(postsCommandRepository);
export const updatePostLikeStatusUseCase = new UpdatePostLikeStatusUseCase(
    postsQueryRepository,
    postLikeStatusCommandRepository,
    postLikeStatusQueryRepository
);

// Controller
export const postsController = new PostsController(
    getPostsUseCase,
    createPostUseCase,
    getPostByIdUseCase,
    updatePostUseCase,
    deletePostUseCase,
    updatePostLikeStatusUseCase
);