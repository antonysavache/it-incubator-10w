import { BaseCommandRepository } from "../../../../../shared/infrastructures/v2/repositories/base-command.repository";
import {IPostDocument, PostModel} from "../../schemas/post.schema";
import {PostCreateDTO} from "../../../domain/interfaces/post.interface";

export class PostsCommandRepository extends BaseCommandRepository<IPostDocument, PostCreateDTO> {
    constructor() {
        super(PostModel);
    }
}