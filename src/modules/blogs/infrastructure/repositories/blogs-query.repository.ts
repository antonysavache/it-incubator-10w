import {BaseQueryRepository} from "../../../../shared/infrastructures/repositories/base-query.repository";
import {BlogDatabaseModel} from "../../domain/interfaces/blog.interface";

export class BlogsQueryRepository extends BaseQueryRepository<BlogDatabaseModel> {
    constructor() {
        super('blogs');
    }
}