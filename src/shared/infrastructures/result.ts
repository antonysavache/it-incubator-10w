export type ErrorType = string | { errorsMessages: { message: string, field: string }[] };

export class Result<T> {
    private constructor(
        private readonly isSuccess: boolean,
        private readonly error?: ErrorType,
        private readonly value?: T
    ) {}

    public getValue(): T {
        if (!this.isSuccess) {
            throw new Error('Can\'t get value from error result');
        }
        return this.value!;
    }

    public getError(): ErrorType {
        if (this.isSuccess) {
            throw new Error('Can\'t get error from success result');
        }
        return this.error!;
    }

    public isFailure(): boolean {
        return !this.isSuccess;
    }

    public static ok<T>(value?: T): Result<T> {
        return new Result<T>(true, undefined, value);
    }

    public static fail<T>(error: ErrorType): Result<T> {
        return new Result<T>(false, error);
    }
}