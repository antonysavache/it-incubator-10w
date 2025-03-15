import { BaseCommandRepository } from "../../../../../shared/infrastructures/repositories/base-command.repository";
import { UserDatabaseModel } from "../../interfaces/user.interface";

export class UsersCommandRepository extends BaseCommandRepository<UserDatabaseModel, UserDatabaseModel> {
    constructor() {
        super('users');
    }
}