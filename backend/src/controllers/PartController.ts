import { Body, Controller, Get, Path, Post, Put, Delete, Route, Tags } from "tsoa";
import { Part } from "../models/Part";
import { PartService } from "../services/PartService";
import { PartNotFoundError } from "../errors/PartNotFoundError";
import { InvalidForeignKeyError } from "../errors/InvalidForeignKeyError";
import { InvalidDataError } from "../errors/InvalidDataError";

@Route("parts")
@Tags("Parts")
export class PartController extends Controller {
    private partService: PartService;

    constructor() {
        super();
        this.partService = new PartService();
    }

    @Get()
    public async getParts(): Promise<Part[]> {
        return this.partService.findAll();
    }

    @Get("{partId}")
    public async getPartById(@Path() partId: string): Promise<Part> {
        try {
            return await this.partService.findById(partId);
        } catch (error) {
            if (error instanceof PartNotFoundError) {
                this.setStatus(PartNotFoundError.httpStatusCode);
                throw error;
            }
            throw error;
        }
    }

    @Post()
    public async createPart(@Body() requestBody: Omit<Part, "id" | "createdAt" | "updatedAt">): Promise<Part> {
        try {
            return await this.partService.create(requestBody);
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

    @Put("{partId}")
    public async updatePart(
        @Path() partId: string,
        @Body() requestBody: Partial<Omit<Part, "id" | "createdAt" | "updatedAt">>
    ): Promise<Part> {
        try {
            return await this.partService.update(partId, requestBody);
        } catch (error) {
            if (error instanceof PartNotFoundError) {
                this.setStatus(PartNotFoundError.httpStatusCode);
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

    @Delete("{partId}")
    public async deletePart(@Path() partId: string): Promise<void> {
        try {
            await this.partService.delete(partId);
            this.setStatus(204);
        } catch (error) {
            if (error instanceof PartNotFoundError) {
                this.setStatus(PartNotFoundError.httpStatusCode);
                throw error;
            }
            if (error instanceof InvalidDataError) {
                this.setStatus(InvalidDataError.httpStatusCode);
                throw error;
            }
            throw error;
        }
    }
} 