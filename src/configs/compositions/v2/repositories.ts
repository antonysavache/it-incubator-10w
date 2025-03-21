import {BlogsQueryRepository} from "../../../modules/blogs/infrastructure/v2/repositories/blogs-query.repository";
import {BlogsCommandRepository} from "../../../modules/blogs/infrastructure/v2/repositories/blogs-command.repository";
import {PostsQueryRepository} from "../../../modules/posts/infrastructure/v2/repositories/posts-query.repository";
import {PostsCommandRepository} from "../../../modules/posts/infrastructure/v2/repositories/posts-command.repository";

export const blogsMQueryRepository = new BlogsQueryRepository();
export const blogsMCommandRepository = new BlogsCommandRepository();

export const postsMQueryRepository = new PostsQueryRepository();
export const postsMCommandRepository = new PostsCommandRepository();