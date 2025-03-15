import {BlogsQueryRepository} from "../../infrastructure/repositories/blogs-query.repository";
import {DEFAULT_QUERY_PARAMS, PageResponse, QueryParams} from "../../../../shared/models/common.model";
import {BlogViewModel} from "../../domain/interfaces/blog.interface";

export class GetBlogsUseCase {
    constructor(private blogsQueryRepository: BlogsQueryRepository) {}

    async execute(params: QueryParams): Promise<PageResponse<BlogViewModel>> {
        return this.blogsQueryRepository.findAll({
            searchParams: params.searchNameTerm
                ? [{ fieldName: 'name', value: params.searchNameTerm }]
                : [],
            sortBy: params.sortBy || DEFAULT_QUERY_PARAMS.sortBy,
            sortDirection: params.sortDirection || DEFAULT_QUERY_PARAMS.sortDirection,
            pageNumber: params.pageNumber || DEFAULT_QUERY_PARAMS.pageNumber,
            pageSize: params.pageSize || DEFAULT_QUERY_PARAMS.pageSize
        });
    }
}