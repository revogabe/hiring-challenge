import { HttpError } from "./HttpError";

export class PartNotFoundError extends HttpError {
    static readonly httpStatusCode = 404;

    constructor(message: string = "Part not found") {
        super(message, PartNotFoundError.httpStatusCode);
        this.name = 'PartNotFoundError';
        Object.setPrototypeOf(this, PartNotFoundError.prototype);
    }
} 