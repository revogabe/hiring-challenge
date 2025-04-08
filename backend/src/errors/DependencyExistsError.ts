import { HttpError } from "./HttpError";

export class DependencyExistsError extends HttpError {
    static readonly httpStatusCode = 400;

    constructor(message: string = "Cannot delete due to existing dependencies") {
        super(message, DependencyExistsError.httpStatusCode);
        this.name = 'DependencyExistsError';
        Object.setPrototypeOf(this, DependencyExistsError.prototype);
    }
} 