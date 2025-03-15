import {PostCreateDTO, PostDatabaseModel} from "../../domain/interfaces/post.interface";
import {BaseCommandRepository} from "../../../../shared/infrastructures/repositories/base-command.repository";

export class PostsCommandRepository extends BaseCommandRepository<PostDatabaseModel, PostCreateDTO> {
    constructor() {
        super('posts');
    }
}