import { ObjectId } from 'mongodb';
import { PostCreateDTO, PostDatabaseModel, PostViewModel } from './interfaces/post.interface';

export class PostEntity {
    constructor(
        private readonly id: ObjectId,
        private readonly title: string,
        private readonly shortDescription: string,
        private readonly content: string,
        private readonly blogId: string,
        private readonly blogName: string,
        private readonly createdAt: string
    ) {}

    static create(
        data: PostCreateDTO & { blogName: string }
    ): PostEntity {
        return new PostEntity(
            new ObjectId(),
            data.title,
            data.shortDescription,
            data.content,
            data.blogId,
            data.blogName,
            new Date().toISOString()
        );
    }

    toDatabaseModel(): PostDatabaseModel {
        return {
            _id: this.id,
            title: this.title,
            shortDescription: this.shortDescription,
            content: this.content,
            blogId: this.blogId,
            blogName: this.blogName,
            createdAt: this.createdAt
        };
    }

    toViewModel(): PostViewModel {
        return {
            id: this.id.toString(),
            title: this.title,
            shortDescription: this.shortDescription,
            content: this.content,
            blogId: this.blogId,
            blogName: this.blogName,
            createdAt: this.createdAt
        };
    }
}