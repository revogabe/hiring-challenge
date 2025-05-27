import { HttpError } from "../../../shared/errors/HttpError";

export class EquipmentNotFoundError extends HttpError {
  static readonly httpStatusCode = 404;

  constructor(message: string = "Equipment not found") {
    super(message, EquipmentNotFoundError.httpStatusCode);
    this.name = "EquipmentNotFoundError";
    Object.setPrototypeOf(this, EquipmentNotFoundError.prototype);
  }
}
