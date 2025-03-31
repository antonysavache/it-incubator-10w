import { PostDatabaseModel, PostViewModel } from "../../domain/interfaces/post.interface";
import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { WithId, ObjectId } from "mongodb";
import { PageResponse } from "../../../../shared/models/common.model";
import { PostLikeStatusQueryRepository } from "./post-like-status-query.repository";

export class PostsQueryRepository extends BaseQueryRepository<PostDatabaseModel> {
    private postLikeStatusQueryRepository: PostLikeStatusQueryRepository;

    constructor() {
        super('posts');
        this.postLikeStatusQueryRepository = new PostLikeStatusQueryRepository();
    }

    init() {
        super.init();
        this.postLikeStatusQueryRepository.init();
    }

    protected async toViewModel(model: WithId<PostDatabaseModel>, userId?: string): Promise<PostViewModel> {
        const likesInfo = await this.postLikeStatusQueryRepository.getLikesInfo(model._id.toString(), userId);

        return {
            id: model._id.toString(),
            title: model.title,
            shortDescription: model.shortDescription,
            content: model.content,
            blogId: model.blogId,
            blogName: model.blogName,
            createdAt: model.createdAt,
            extendedLikesInfo: likesInfo
        };
    }

    async findById(id: string, userId?: string): Promise<PostViewModel | null> {
        this.checkInit();
        try {
            const post = await this.collection.findOne({ _id: new ObjectId(id) });
            return post ? await this.toViewModel(post, userId) : null;
        } catch (e) {
            console.error('Error finding post by id:', e);
            return null;
        }
    }

    // Override findAll to include userId for like status
    async findAll(params: any, userId?: string): Promise<PageResponse<PostViewModel>> {
        this.checkInit();

        const filter = this.buildFilter(params.searchParams, params.blogId ? { blogId: params.blogId } : {});

        let query = this.collection.find(filter);

        if (params.sortBy) {
            const sortDirection = params.sortDirection === 'asc' ? 1 : -1;
            query = query.sort({ [params.sortBy]: sortDirection });
        }

        const skip = (Number(params.pageNumber) - 1) * Number(params.pageSize);
        const limit = Number(params.pageSize);

        const [items, totalCount] = await Promise.all([
            query.skip(skip).limit(limit).toArray(),
            this.collection.countDocuments(filter)
        ]);

        // Convert each post to view model with likes info
        const postsWithLikes = await Promise.all(
            items.map(item => this.toViewModel(item, userId))
        );

        return {
            pagesCount: Math.ceil(totalCount / limit),
            page: Number(params.pageNumber),
            pageSize: limit,
            totalCount,
            items: postsWithLikes
        };
    }
}