import {BaseCommandRepository} from "../../../../shared/infrastructures/repositories/base-command.repository";
import {BlogCreateDTO, BlogDatabaseModel} from "../../domain/interfaces/blog.interface";

export class BlogsCommandRepository extends BaseCommandRepository<BlogDatabaseModel, BlogCreateDTO> {
    constructor() {
        super('blogs');
    }
}