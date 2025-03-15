import { ObjectId } from 'mongodb';
import {BlogDatabaseModel, BlogViewModel} from "./interfaces/blog.interface";

export class BlogEntity {
    constructor(
        private readonly id: ObjectId,
        private readonly name: string,
        private readonly description: string,
        private readonly websiteUrl: string,
        private readonly createdAt: string,
        private readonly isMembership: boolean
    ) {}

    static create(
        name: string,
        description: string,
        websiteUrl: string
    ): BlogEntity {
        return new BlogEntity(
            new ObjectId(),
            name,
            description,
            websiteUrl,
            new Date().toISOString(),
            false
        );
    }

    toDatabaseModel(): BlogDatabaseModel {
        return {
            _id: this.id,
            name: this.name,
            description: this.description,
            websiteUrl: this.websiteUrl,
            createdAt: this.createdAt,
            isMembership: this.isMembership
        };
    }

    toViewModel(): BlogViewModel {
        return {
            id: this.id.toString(),
            name: this.name,
            description: this.description,
            websiteUrl: this.websiteUrl,
            createdAt: this.createdAt,
            isMembership: this.isMembership
        };
    }
}