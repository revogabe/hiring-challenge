import { HttpError } from "../../../shared/errors/HttpError";

export class MaintenanceNotFoundError extends HttpError {
  static readonly httpStatusCode = 404;

  constructor() {
    super("Maintenance not found", MaintenanceNotFoundError.httpStatusCode);
  }
}
