import { HttpError } from "../../../shared/errors/HttpError";

export class AreaNotFoundError extends HttpError {
  static readonly httpStatusCode = 404;

  constructor(message: string = "Area not found") {
    super(message, AreaNotFoundError.httpStatusCode);
    this.name = "AreaNotFoundError";
    Object.setPrototypeOf(this, AreaNotFoundError.prototype);
  }
}
