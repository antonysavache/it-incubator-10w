// src/configs/compositions/repositories.ts
import { BlogsQueryRepository } from "../../modules/blogs/infrastructure/repositories/blogs-query.repository";
import { BlogsCommandRepository } from "../../modules/blogs/infrastructure/repositories/blogs-command.repository";
import { PostsQueryRepository } from "../../modules/posts/infrastructure/repositories/posts-query.repository";
import { PostsCommandRepository } from "../../modules/posts/infrastructure/repositories/posts-command.repository";
import { UsersQueryRepository } from "../../modules/users/domain/infrastructures/repositories/users-query.repository";
import { UsersCommandRepository } from "../../modules/users/domain/infrastructures/repositories/users-command.repository";
import { TokenCommandRepository } from "../../modules/auth/infrastructure/repositories/token-command.repository";
import { UserConfirmationRepository } from "../../modules/auth/infrastructure/repositories/user-confirmation.repository";
import { TokenQueryRepository } from "../../modules/auth/infrastructure/repositories/token-query.repository";
import { CommentsQueryRepository } from "../../modules/comments/infrastructure/repositories/comments-query.repository";
import { CommentsCommandRepository } from "../../modules/comments/infrastructure/repositories/comments-command.repository";
import { DeviceCommandRepository } from "../../modules/auth/infrastructure/repositories/device-command.repository";
import { DeviceQueryRepository } from "../../modules/auth/infrastructure/repositories/device-query.repository";
import {
    PasswordRecoveryRepository
} from "../../modules/auth/infrastructure/repositories/password-recovery-command.repository";
import {
    LikeStatusQueryRepository
} from "../../modules/comments/infrastructure/repositories/like-status-query.repository";
import {
    LikeStatusCommandRepository
} from "../../modules/comments/infrastructure/repositories/like-status-command.repository";
import {
    PostLikeStatusQueryRepository
} from "../../modules/posts/infrastructure/repositories/post-like-status-query.repository";
import {
    PostLikeStatusCommandRepository
} from "../../modules/posts/infrastructure/repositories/post-like-status-command.repository";

export const blogsQueryRepository = new BlogsQueryRepository();
export const blogsCommandRepository = new BlogsCommandRepository();
export const postsQueryRepository = new PostsQueryRepository();
export const postsCommandRepository = new PostsCommandRepository();
export const usersQueryRepository = new UsersQueryRepository();
export const usersCommandRepository = new UsersCommandRepository();
export const tokenCommandRepository = new TokenCommandRepository();
export const tokenQueryRepository = new TokenQueryRepository();
export const userConfirmationRepository = new UserConfirmationRepository();
export const passwordRecoveryRepository = new PasswordRecoveryRepository();
export const commentsQueryRepository = new CommentsQueryRepository();
export const commentsCommandRepository = new CommentsCommandRepository();
export const deviceCommandRepository = new DeviceCommandRepository();
export const deviceQueryRepository = new DeviceQueryRepository();
export const likeStatusCommandRepository = new LikeStatusCommandRepository();
export const likeStatusQueryRepository = new LikeStatusQueryRepository();
export const postLikeStatusCommandRepository = new PostLikeStatusCommandRepository();
export const postLikeStatusQueryRepository = new PostLikeStatusQueryRepository();