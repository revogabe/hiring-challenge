import { Body, Controller, Get, Path, Post, Put, Delete, Route, Tags } from "tsoa";
import { Plant } from "../models/Plant";
import { PlantService } from "../services/PlantService";
import { PlantNotFoundError } from "../errors/PlantNotFoundError";
import { InvalidDataError } from "../errors/InvalidDataError";
import { DependencyExistsError } from "../errors/DependencyExistsError";

@Route("plants")
@Tags("Plant")
export class PlantController extends Controller {
    private plantService: PlantService;

    constructor() {
        super();
        this.plantService = new PlantService();
    }

    @Get()
    public async getPlants(): Promise<Plant[]> {
        return this.plantService.findAll();
    }

    @Get("{plantId}")
    public async getPlant(@Path() plantId: string): Promise<Plant> {
        try {
            return await this.plantService.findById(plantId);
        } catch (error) {
            if (error instanceof PlantNotFoundError) {
                this.setStatus(PlantNotFoundError.httpStatusCode);
                throw error;
            }
            throw error;
        }
    }

    @Post()
    public async createPlant(@Body() requestBody: Pick<Plant, "name" | "address">): Promise<Plant> {
        try {
            return await this.plantService.create(requestBody);
        } catch (error) {
            if (error instanceof InvalidDataError) {
                this.setStatus(InvalidDataError.httpStatusCode);
                throw error;
            }
            throw error;
        }
    }

    @Put("{plantId}")
    public async updatePlant(
        @Path() plantId: string,
        @Body() requestBody: Partial<Pick<Plant, "name" | "address">>
    ): Promise<Plant> {
        try {
            return await this.plantService.update(plantId, requestBody);
        } catch (error) {
            if (error instanceof PlantNotFoundError) {
                this.setStatus(PlantNotFoundError.httpStatusCode);
                throw error;
            }
            if (error instanceof InvalidDataError) {
                this.setStatus(InvalidDataError.httpStatusCode);
                throw error;
            }
            throw error;
        }
    }

    @Delete("{plantId}")
    public async deletePlant(@Path() plantId: string): Promise<void> {
        try {
            await this.plantService.delete(plantId);
            this.setStatus(204);
        } catch (error) {
            if (error instanceof PlantNotFoundError) {
                this.setStatus(PlantNotFoundError.httpStatusCode);
                throw error;
            }
            if (error instanceof DependencyExistsError) {
                this.setStatus(DependencyExistsError.httpStatusCode);
                throw error;
            }
            throw error;
        }
    }
} 