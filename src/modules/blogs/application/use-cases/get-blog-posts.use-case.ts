// src/modules/blogs/application/use-cases/get-blog-posts.use-case.ts
import {BlogsQueryRepository} from "../../infrastructure/repositories/blogs-query.repository";
import {DEFAULT_QUERY_PARAMS, PageResponse, QueryParams} from "../../../../shared/models/common.model";
import {Result} from "../../../../shared/infrastructures/result";
import {PostViewModel} from "../../../posts/domain/interfaces/post.interface";
import {PostsQueryRepository} from "../../../posts/infrastructure/repositories/posts-query.repository";

export class GetBlogPostsUseCase {
    constructor(
        private blogsQueryRepository: BlogsQueryRepository,
        private postsQueryRepository: PostsQueryRepository
    ) {}

    // **** ADD OPTIONAL userId PARAMETER ****
    async execute(blogId: string, params: QueryParams, userId?: string): Promise<Result<PageResponse<PostViewModel>>> {
        const blog = await this.blogsQueryRepository.findById(blogId);

        if (!blog) {
            return Result.fail('Blog not found');
        }

        // **** PASS userId TO findAll ****
        const posts = await this.postsQueryRepository.findAll({
            searchParams: [],
            sortBy: params.sortBy || DEFAULT_QUERY_PARAMS.sortBy,
            sortDirection: params.sortDirection || DEFAULT_QUERY_PARAMS.sortDirection,
            pageNumber: params.pageNumber || DEFAULT_QUERY_PARAMS.pageNumber,
            pageSize: params.pageSize || DEFAULT_QUERY_PARAMS.pageSize,
            blogId
        }, userId); // Pass userId here

        return Result.ok(posts);
    }
}