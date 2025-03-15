import { Request, Response } from 'express';
import { CreateUserUseCase } from "../application/use-cases/create-user.use-case";
import { GetUsersUseCase } from "../application/use-cases/get-users.use-case";
import { QueryParams } from "../../../shared/models/common.model";
import {UserCreateDTO} from "../domain/interfaces/user.interface";
import {DeleteUserUseCase} from "../application/use-cases/delete-user.use-case";

export class UsersController {
    constructor(
        private createUserUseCase: CreateUserUseCase,
        private getUsersUseCase: GetUsersUseCase,
        private deleteUserUseCase: DeleteUserUseCase
    ) {}

    getUsers = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
        const users = await this.getUsersUseCase.execute(req.query);
        return res.status(200).json(users);
    }

    createUser = async (req: Request<{}, {}, UserCreateDTO>, res: Response) => {
        const result = await this.createUserUseCase.execute(req.body);

        if (result.isFailure()) {
            const error = result.getError();
            if (error['errorsMessages']) {
                res.status(400).json(error);
            }
            res.status(400).json({
                errorsMessages: [{ message: error, field: 'none' }]
            });
        } else {
            res.status(201).json(result.getValue());
        }
    }

    deleteUser = async (req: Request<{ id: string }>, res: Response) => {
        const result = await this.deleteUserUseCase.execute(req.params.id);

        if (result.isFailure()) {
            return res.sendStatus(404);
        }

        return res.sendStatus(204);
    }
}