import {PostsQueryRepository} from "../../infrastructure/repositories/posts-query.repository";
import {DEFAULT_QUERY_PARAMS, PageResponse, QueryParams} from "../../../../shared/models/common.model";
import {PostViewModel} from "../../domain/interfaces/post.interface";

export class GetPostsUseCase {
    constructor(private postsQueryRepository: PostsQueryRepository) {}

    async execute(params: QueryParams): Promise<PageResponse<PostViewModel>> {
        return this.postsQueryRepository.findAll({
            searchParams: [],
            sortBy: params.sortBy || DEFAULT_QUERY_PARAMS.sortBy,
            sortDirection: params.sortDirection || DEFAULT_QUERY_PARAMS.sortDirection,
            pageNumber: params.pageNumber || DEFAULT_QUERY_PARAMS.pageNumber,
            pageSize: params.pageSize || DEFAULT_QUERY_PARAMS.pageSize
        });
    }
}