import {UserDatabaseModel} from "../../interfaces/user.interface";
import {BaseQueryRepository} from "../../../../../shared/infrastructures/repositories/base-query.repository";
import {Filter} from "mongodb";

export class UsersQueryRepository extends BaseQueryRepository<UserDatabaseModel> {
    constructor() {
        super('users');
    }

    async findByFilter(filter: Filter<UserDatabaseModel>): Promise<UserDatabaseModel | null> {
        this.checkInit();
        return this.collection.findOne(filter);
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDatabaseModel | null> {
        return this.findByFilter({
            $or: [
                { login: loginOrEmail },
                { email: loginOrEmail }
            ]
        });
    }
}