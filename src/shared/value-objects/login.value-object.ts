import {ValidationResult} from "../models/validation-result.model";
import {ErrorMessage} from "../models/common.model";
import {Result} from "../infrastructures/result";

export class Login {
    private constructor(private readonly value: string) {}

    static validate(login: string): ValidationResult {
        const errors: ErrorMessage[] = [];

        if (!login?.trim()) {
            errors.push({
                message: 'Login is required',
                field: 'login'
            });
        } else {
            const loginRegex = /^[a-zA-Z0-9_-]{3,10}$/;
            if (!loginRegex.test(login)) {
                errors.push({
                    message: 'Login should be 3-10 characters and contain only latin letters, numbers, dash and underscore',
                    field: 'login'
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static create(login: string): Result<Login> {
        const validation = this.validate(login);
        if (!validation.isValid) {
            return Result.fail({ errorsMessages: validation.errors });
        }
        return Result.ok(new Login(login));
    }

    getValue(): string {
        return this.value;
    }
}