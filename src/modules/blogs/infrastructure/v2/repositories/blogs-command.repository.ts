import { BaseCommandRepository } from "../../../../../shared/infrastructures/v2/repositories/base-command.repository";
import {BlogModel, IBlogDocument} from "../../schemas/blog.schema";
import {BlogCreateDTO} from "../../../domain/interfaces/blog.interface";

export class BlogsCommandRepository extends BaseCommandRepository<IBlogDocument, BlogCreateDTO> {
    constructor() {
        super(BlogModel);
    }
}