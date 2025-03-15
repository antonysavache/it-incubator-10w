import {ValidationResult} from "../models/validation-result.model";
import {ErrorMessage} from "../models/common.model";
import {Result} from "../infrastructures/result";
import bcrypt from "bcrypt";

export class Password {
    private constructor(
        private readonly value: string,
        private readonly hashedValue?: string
    ) {}

    static validate(password: string): ValidationResult {
        const errors: ErrorMessage[] = [];

        if (!password?.trim()) {
            errors.push({
                message: 'Password is required',
                field: 'password'
            });
        } else {
            if (password.length < 6 || password.length > 20) {
                errors.push({
                    message: 'Password should be 6-20 characters',
                    field: 'password'
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static create(password: string): Result<Password> {
        const validation = this.validate(password);
        if (!validation.isValid) {
            return Result.fail({ errorsMessages: validation.errors });
        }
        return Result.ok(new Password(password));
    }

    static createHashed(hashedPassword: string): Password {
        return new Password('', hashedPassword);
    }

    async hash(saltRounds: number): Promise<string> {
        if (this.hashedValue) {
            throw new Error('Password is already hashed');
        }
        return bcrypt.hash(this.value, saltRounds);
    }

    async compareWith(plainPassword: string): Promise<boolean> {
        if (!this.hashedValue) {
            throw new Error('Cannot compare unhashed password');
        }
        return bcrypt.compare(plainPassword, this.hashedValue);
    }

    getHashedValue(): string {
        if (!this.hashedValue) {
            throw new Error('Password is not hashed');
        }
        return this.hashedValue;
    }
}