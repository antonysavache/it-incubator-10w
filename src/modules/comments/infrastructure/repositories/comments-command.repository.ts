import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { CommentDatabaseModel } from "../../domain/interfaces/comment.interface";

export class CommentsCommandRepository extends BaseCommandRepository<CommentDatabaseModel, CommentDatabaseModel> {
    constructor() {
        super('comments');
    }
}