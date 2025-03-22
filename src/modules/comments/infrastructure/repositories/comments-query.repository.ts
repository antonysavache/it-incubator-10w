import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { CommentDatabaseModel, CommentViewModel } from "../../domain/interfaces/comment.interface";
import { WithId, ObjectId } from "mongodb";
import { PageResponse, DEFAULT_QUERY_PARAMS } from "../../../../shared/models/common.model";
import { LikeStatusQueryRepository } from "./like-status-query.repository";

export class CommentsQueryRepository extends BaseQueryRepository<CommentDatabaseModel> {
    private likeStatusQueryRepository: LikeStatusQueryRepository;

    constructor() {
        super('comments');
        this.likeStatusQueryRepository = new LikeStatusQueryRepository();
    }

    init() {
        super.init();
        this.likeStatusQueryRepository.init();
    }

    private async toPublicViewModel(model: WithId<CommentDatabaseModel>, userId?: string): Promise<CommentViewModel> {
        // Make sure userId is passed to getLikesInfo even when undefined/empty
        const likesInfo = await this.likeStatusQueryRepository.getLikesInfo(model._id.toString(), userId);

        return {
            id: model._id.toString(),
            content: model.content,
            commentatorInfo: {
                userId: model.userId,
                userLogin: model.userLogin
            },
            createdAt: model.createdAt,
            likesInfo
        };
    }

    async findPublicById(id: string, userId?: string): Promise<CommentViewModel | null> {
        this.checkInit();
        const result = await this.collection.findOne({ _id: new ObjectId(id) });
        return result ? await this.toPublicViewModel(result, userId) : null;
    }

    async findByPostId(
        postId: string,
        sortBy: string = DEFAULT_QUERY_PARAMS.sortBy,
        sortDirection: 'asc' | 'desc' = DEFAULT_QUERY_PARAMS.sortDirection,
        pageNumber: string = DEFAULT_QUERY_PARAMS.pageNumber,
        pageSize: string = DEFAULT_QUERY_PARAMS.pageSize,
        userId?: string
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

        const commentViewModels = await Promise.all(
            items.map(item => this.toPublicViewModel(item, userId))
        );

        return {
            pagesCount: Math.ceil(totalCount / limit),
            page: Number(pageNumber),
            pageSize: limit,
            totalCount,
            items: commentViewModels
        };
    }
}