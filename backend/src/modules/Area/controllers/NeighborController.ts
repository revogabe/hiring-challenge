import { Body, Controller, Get, Path, Post, Delete, Route, Tags } from "tsoa";
import { Area } from "../../../shared/models/Area";
import { NeighborService } from "../services/NeighborService";
import { AreaNotFoundError } from "../errors/AreaNotFoundError";
import { InvalidDataError } from "../../../shared/errors/InvalidDataError";

@Route("neighbors")
@Tags("Neighbor")
export class NeighborController extends Controller {
  private neighborService: NeighborService;

  constructor() {
    super();
    this.neighborService = new NeighborService();
  }

  @Post("{areaId}")
  public async addNeighbor(
    @Path() areaId: string,
    @Body() requestBody: { neighborIds: string[] }
  ): Promise<{ message: string }> {
    try {
      const { neighborIds } = requestBody;

      if (!areaId || !neighborIds) {
        this.setStatus(400);
        throw new InvalidDataError("Area ID and neighbor IDs are required");
      }

      await this.neighborService.addNeighbor(areaId, neighborIds);
      this.setStatus(201);
      return { message: "Neighbor relationship created successfully" };
    } catch (error) {
      if (error instanceof AreaNotFoundError) {
        this.setStatus(AreaNotFoundError.httpStatusCode);
        throw error;
      }
      if (error instanceof InvalidDataError) {
        this.setStatus(InvalidDataError.httpStatusCode);
        throw error;
      }
      throw error;
    }
  }

  @Delete("{areaId}")
  public async removeNeighbor(
    @Path() areaId: string,
    @Body() requestBody: { neighborIds: string[] }
  ): Promise<{ message: string }> {
    const { neighborIds } = requestBody;

    try {
      await this.neighborService.removeNeighbor(areaId, neighborIds);
      this.setStatus(204);
      return { message: "Neighbor relationship removed successfully" };
    } catch (error) {
      if (error instanceof AreaNotFoundError) {
        this.setStatus(AreaNotFoundError.httpStatusCode);
        throw error;
      }
      throw error;
    }
  }

  @Get("{areaId}")
  public async getNeighbors(@Path() areaId: string): Promise<Area[]> {
    try {
      return await this.neighborService.getNeighbors(areaId);
    } catch (error) {
      if (error instanceof AreaNotFoundError) {
        this.setStatus(AreaNotFoundError.httpStatusCode);
        throw error;
      }
      throw error;
    }
  }
}
