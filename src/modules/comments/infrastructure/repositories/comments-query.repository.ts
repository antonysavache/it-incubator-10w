import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { CommentDatabaseModel, CommentViewModel } from "../../domain/interfaces/comment.interface";
import { WithId, ObjectId } from "mongodb";
import { PageResponse, DEFAULT_QUERY_PARAMS } from "../../../../shared/models/common.model";

export class CommentsQueryRepository extends BaseQueryRepository<CommentDatabaseModel> {
    constructor() {
        super('comments');
    }

    private toPublicViewModel(model: WithId<CommentDatabaseModel>): CommentViewModel {
        return {
            id: model._id.toString(),
            content: model.content,
            commentatorInfo: {
                userId: model.userId,
                userLogin: model.userLogin
            },
            createdAt: model.createdAt
        };
    }

    async findPublicById(id: string): Promise<CommentViewModel | null> {
        this.checkInit();
        const result = await this.collection.findOne({ _id: new ObjectId(id) });
        return result ? this.toPublicViewModel(result) : null;
    }

    async findByPostId(
        postId: string,
        sortBy: string = DEFAULT_QUERY_PARAMS.sortBy,
        sortDirection: 'asc' | 'desc' = DEFAULT_QUERY_PARAMS.sortDirection,
        pageNumber: string = DEFAULT_QUERY_PARAMS.pageNumber,
        pageSize: string = DEFAULT_QUERY_PARAMS.pageSize
    ): Promise<PageResponse<CommentViewModel>> {
        this.checkInit();

        const filter = { postId };
        const skip = (Number(pageNumber) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        const [items, totalCount] = await Promise.all([
            this.collection
                .find(filter)
                .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            this.collection.countDocuments(filter)
        ]);

        return {
            pagesCount: Math.ceil(totalCount / limit),
            page: Number(pageNumber),
            pageSize: limit,
            totalCount,
            items: items.map(item => this.toPublicViewModel(item))
        };
    }
}