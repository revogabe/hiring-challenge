import { HttpError } from "./HttpError";

export class PlantNotFoundError extends HttpError {
    static readonly httpStatusCode = 404;

    constructor(message: string = "Plant not found") {
        super(message, PlantNotFoundError.httpStatusCode);
        this.name = 'PlantNotFoundError';
        Object.setPrototypeOf(this, PlantNotFoundError.prototype);
    }
} 