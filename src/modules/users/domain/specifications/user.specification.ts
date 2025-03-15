import { Result } from "../../../../shared/infrastructures/result";

export class UserSpecification {
    validateCreateUser(login: string, email: string, password: string): Result<void> {
        const errors: { message: string; field: string }[] = [];

        if (!login?.trim()) {
            errors.push({ message: 'Login is required', field: 'login' });
        }

        if (!email?.trim()) {
            errors.push({ message: 'Email is required', field: 'email' });
        }

        if (!password?.trim()) {
            errors.push({ message: 'Password is required', field: 'password' });
        }

        const loginRegex = /^[a-zA-Z0-9_-]{3,10}$/;
        if (login?.trim() && !loginRegex.test(login)) {
            errors.push({
                message: 'Login should be 3-10 characters and contain only latin letters, numbers, dash and underscore',
                field: 'login'
            });
        }

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (email?.trim() && !emailRegex.test(email)) {
            errors.push({
                message: 'Invalid email format',
                field: 'email'
            });
        }

        if (password?.trim() && (password.length < 6 || password.length > 20)) {
            errors.push({
                message: 'Password should be 6-20 characters',
                field: 'password'
            });
        }

        if (errors.length > 0) {
            return Result.fail({ errorsMessages: errors });
        }

        return Result.ok();
    }
}