import { HttpError } from "../../../shared/errors/HttpError";

export class NeighboringAreaError extends HttpError {
  static readonly httpStatusCode = 400;

  constructor(message: string = "An area cannot be a neighbor of itself") {
    super(message, NeighboringAreaError.httpStatusCode);
    this.name = "NeighboringAreaError";
    Object.setPrototypeOf(this, NeighboringAreaError.prototype);
  }
}
