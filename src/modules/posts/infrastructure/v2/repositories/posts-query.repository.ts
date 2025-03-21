import { BaseQueryRepository } from "../../../../../shared/infrastructures/v2/repositories/base-query.repository";
import {IPostDocument, PostModel} from "../../schemas/post.schema";
import {PostViewModel} from "../../../domain/interfaces/post.interface";

export class PostsQueryRepository extends BaseQueryRepository<IPostDocument, PostViewModel> {
    constructor() {
        super(PostModel);
    }

    protected toViewModel(doc: IPostDocument): PostViewModel {
        return {
            id: doc._id.toString(),
            title: doc.title,
            shortDescription: doc.shortDescription,
            content: doc.content,
            blogId: doc.blogId,
            blogName: doc.blogName,
            createdAt: doc.createdAt
        };
    }
}