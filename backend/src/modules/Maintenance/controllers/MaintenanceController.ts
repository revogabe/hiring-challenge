import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Delete,
  Route,
  Tags,
} from "tsoa";
import { Maintenance } from "../../../shared/models/Maintenance";
import { MaintenanceService } from "../services/MaintenanceService";
import { MaintenanceNotFoundError } from "../errors/MaintenanceNotFoundError";
import { InvalidForeignKeyError } from "../../../shared/errors/InvalidForeignKeyError";
import { InvalidDataError } from "../../../shared/errors/InvalidDataError";

@Route("maintenance")
@Tags("Maintenance")
export class MaintenanceController extends Controller {
  private maintenanceService: MaintenanceService;

  constructor() {
    super();
    this.maintenanceService = new MaintenanceService();
  }

  @Get()
  public async getMaintenances(): Promise<Maintenance[]> {
    return this.maintenanceService.findAll();
  }

  @Get("future")
  public async getFutureMaintenances(): Promise<Maintenance[]> {
    return this.maintenanceService.findAllFuture();
  }

  @Get("{maintenanceId}")
  public async getMaintenance(
    @Path() maintenanceId: string
  ): Promise<Maintenance> {
    try {
      return await this.maintenanceService.findById(maintenanceId);
    } catch (error) {
      if (error instanceof MaintenanceNotFoundError) {
        this.setStatus(MaintenanceNotFoundError.httpStatusCode);
        throw error;
      }
      throw error;
    }
  }

  @Post()
  public async createMaintenance(
    @Body()
    requestBody: Pick<
      Maintenance,
      | "frequencyType"
      | "frequencyValue"
      | "title"
      | "description"
      | "referenceType"
      | "partId"
    >
  ): Promise<Maintenance> {
    try {
      return await this.maintenanceService.create(requestBody);
    } catch (error) {
      if (error instanceof InvalidForeignKeyError) {
        this.setStatus(InvalidForeignKeyError.httpStatusCode);
        throw error;
      }
      if (error instanceof InvalidDataError) {
        this.setStatus(InvalidDataError.httpStatusCode);
        throw error;
      }
      throw error;
    }
  }

  @Put("{maintenanceId}")
  public async updateMaintenance(
    @Path() maintenanceId: string,
    @Body()
    requestBody: Partial<Omit<Maintenance, "id" | "createdAt" | "updatedAt">>
  ): Promise<Maintenance> {
    try {
      return await this.maintenanceService.update(maintenanceId, requestBody);
    } catch (error) {
      if (error instanceof MaintenanceNotFoundError) {
        this.setStatus(MaintenanceNotFoundError.httpStatusCode);
        throw error;
      }
      if (error instanceof InvalidForeignKeyError) {
        this.setStatus(InvalidForeignKeyError.httpStatusCode);
        throw error;
      }
      if (error instanceof InvalidDataError) {
        this.setStatus(InvalidDataError.httpStatusCode);
        throw error;
      }
      throw error;
    }
  }

  @Put("{maintenanceId}/complete")
  public async completeMaintenance(
    @Path() maintenanceId: string,
    @Body() requestBody: Date
  ): Promise<Maintenance> {
    try {
      return await this.maintenanceService.markComplete(
        maintenanceId,
        requestBody
      );
    } catch (error) {
      if (error instanceof MaintenanceNotFoundError) {
        this.setStatus(MaintenanceNotFoundError.httpStatusCode);
        throw error;
      }
      throw error;
    }
  }

  @Delete("{maintenanceId}")
  public async deleteMaintenance(@Path() maintenanceId: string): Promise<void> {
    try {
      await this.maintenanceService.delete(maintenanceId);
      this.setStatus(204);
    } catch (error) {
      if (error instanceof MaintenanceNotFoundError) {
        this.setStatus(MaintenanceNotFoundError.httpStatusCode);
        throw error;
      }
      throw error;
    }
  }
}
