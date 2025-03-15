import {BlogsCommandRepository} from "../../infrastructure/repositories/blogs-command.repository";
import {BlogCreateDTO, BlogViewModel} from "../../domain/interfaces/blog.interface";
import {Result} from "../../../../shared/infrastructures/result";
import {BlogEntity} from "../../domain/blog.entity";

export class CreateBlogUseCase {
    constructor(private blogsCommandRepository: BlogsCommandRepository) {}

    async execute(dto: BlogCreateDTO): Promise<Result<BlogViewModel>> {
        try {
            const blog = BlogEntity.create(
                dto.name,
                dto.description,
                dto.websiteUrl
            );

            await this.blogsCommandRepository.create(blog.toDatabaseModel());

            return Result.ok(blog.toViewModel());
        } catch (error) {
            return Result.fail(error.message);
        }
    }
}