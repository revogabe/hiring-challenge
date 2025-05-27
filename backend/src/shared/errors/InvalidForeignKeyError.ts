import { HttpError } from "./HttpError";

export class InvalidForeignKeyError extends HttpError {
    static readonly httpStatusCode = 400;

    constructor(message: string = "Invalid reference ID") {
        super(message, InvalidForeignKeyError.httpStatusCode);
        this.name = 'InvalidForeignKeyError';
        Object.setPrototypeOf(this, InvalidForeignKeyError.prototype);
    }
} 