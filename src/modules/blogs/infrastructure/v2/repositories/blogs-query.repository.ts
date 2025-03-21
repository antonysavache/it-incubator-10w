import { BaseQueryRepository } from "../../../../../shared/infrastructures/v2/repositories/base-query.repository";
import {BlogModel, IBlogDocument} from "../../schemas/blog.schema";
import {BlogViewModel} from "../../../domain/interfaces/blog.interface";

export class BlogsQueryRepository extends BaseQueryRepository<IBlogDocument, BlogViewModel> {
    constructor() {
        super(BlogModel);
    }

    protected toViewModel(doc: IBlogDocument): BlogViewModel {
        return {
            id: doc._id.toString(),
            name: doc.name,
            description: doc.description,
            websiteUrl: doc.websiteUrl,
            createdAt: doc.createdAt,
            isMembership: doc.isMembership
        };
    }
}