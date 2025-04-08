export class HttpError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
} 