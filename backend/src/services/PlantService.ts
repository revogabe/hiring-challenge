import { Plant } from "../models/Plant";
import { DatabaseContext } from "../config/database-context";
import { Repository, QueryFailedError } from "typeorm";
import { PlantNotFoundError } from "../errors/PlantNotFoundError";
import { InvalidDataError } from "../errors/InvalidDataError";
import { DependencyExistsError } from "../errors/DependencyExistsError";

export class PlantService {
    private plantRepository: Repository<Plant>;

    constructor() {
        this.plantRepository = DatabaseContext.getInstance().getRepository(Plant);
    }

    public async findAll(): Promise<Plant[]> {
        return this.plantRepository.find({
            relations: ["areas", "areas.equipment"]
        });
    }

    public async findById(id: string): Promise<Plant> {
        const plant = await this.plantRepository.findOne({
            where: { id },
            relations: ["areas", "areas.equipment"]
        });
        if (!plant) {
            throw new PlantNotFoundError();
        }
        return plant;
    }

    public async create(data: Pick<Plant, "name" | "address">): Promise<Plant> {
        try {
            const plant = this.plantRepository.create(data);
            return await this.plantRepository.save(plant);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new InvalidDataError("Invalid plant data");
            }
            throw error;
        }
    }

    public async update(id: string, data: Partial<Pick<Plant, "name" | "address">>): Promise<Plant> {
        const plant = await this.plantRepository.findOne({ where: { id } });
        if (!plant) {
            throw new PlantNotFoundError();
        }

        try {
            Object.assign(plant, data);
            return await this.plantRepository.save(plant);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new InvalidDataError("Invalid plant data");
            }
            throw error;
        }
    }

    public async delete(id: string): Promise<void> {
        const plant = await this.plantRepository.findOne({ 
            where: { id },
            relations: ["areas"]
        });
        if (!plant) {
            throw new PlantNotFoundError();
        }

        try {
            await this.plantRepository.remove(plant);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new DependencyExistsError("Cannot delete plant with associated areas");
            }
            throw error;
        }
    }
} 