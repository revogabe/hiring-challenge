import { HttpError } from "./HttpError";

export class InvalidDataError extends HttpError {
    static readonly httpStatusCode = 400;

    constructor(message: string = "Invalid data provided") {
        super(message, InvalidDataError.httpStatusCode);
        this.name = 'InvalidDataError';
        Object.setPrototypeOf(this, InvalidDataError.prototype);
    }
} 