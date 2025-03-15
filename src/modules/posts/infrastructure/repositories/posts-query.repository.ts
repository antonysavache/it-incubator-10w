import { PostDatabaseModel } from "../../domain/interfaces/post.interface";
import {BaseQueryRepository} from "../../../../shared/infrastructures/repositories/base-query.repository";
import {WithId} from "mongodb";

export class PostsQueryRepository extends BaseQueryRepository<PostDatabaseModel> {
    constructor() {
        super('posts');
    }

    protected override toViewModel(model: WithId<PostDatabaseModel>) {
        const { _id, ...rest } = model;
        return {
            id: _id.toString(),
            ...rest
        };
    }
}