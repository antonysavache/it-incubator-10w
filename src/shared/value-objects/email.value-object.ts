import {ValidationResult} from "../models/validation-result.model";
import {ErrorMessage} from "../models/common.model";
import {Result} from "../infrastructures/result";

export class Email {
    private constructor(private readonly value: string) {}

    static validate(email: string): ValidationResult {
        const errors: ErrorMessage[] = [];

        if (!email?.trim()) {
            errors.push({
                message: 'Email is required',
                field: 'email'
            });
        } else {
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (!emailRegex.test(email)) {
                errors.push({
                    message: 'Invalid email format',
                    field: 'email'
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static create(email: string): Result<Email> {
        const validation = this.validate(email);
        if (!validation.isValid) {
            return Result.fail({ errorsMessages: validation.errors });
        }
        return Result.ok(new Email(email.toLowerCase()));
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}