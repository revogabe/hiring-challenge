import { Equipment } from "../models/Equipment";
import { DatabaseContext } from "../config/database-context";
import { Repository, QueryFailedError } from "typeorm";
import { EquipmentNotFoundError } from "../errors/EquipmentNotFoundError";
import { InvalidForeignKeyError } from "../errors/InvalidForeignKeyError";
import { InvalidDataError } from "../errors/InvalidDataError";
import { DependencyExistsError } from "../errors/DependencyExistsError";

export class EquipmentService {
    private equipmentRepository: Repository<Equipment>;

    constructor() {
        this.equipmentRepository = DatabaseContext.getInstance().getRepository(Equipment);
    }

    public async findAll(): Promise<Equipment[]> {
        return this.equipmentRepository.find({
            relations: ["area", "parts"]
        });
    }

    public async findById(id: string): Promise<Equipment> {
        const equipment = await this.equipmentRepository.findOne({
            where: { id },
            relations: ["area", "parts"]
        });
        if (!equipment) {
            throw new EquipmentNotFoundError();
        }
        return equipment;
    }

    public async create(data: Omit<Equipment, "id" | "createdAt" | "updatedAt">): Promise<Equipment> {
        try {
            const equipment = this.equipmentRepository.create(data);
            const savedEquipment = await this.equipmentRepository.save(equipment);
            return this.equipmentRepository.findOne({
                where: { id: savedEquipment.id },
                relations: ["area"]
            }) as Promise<Equipment>;
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes('FOREIGN KEY')) {
                throw new InvalidForeignKeyError("Invalid area ID");
            }
            if (error instanceof QueryFailedError) {
                throw new InvalidDataError("Invalid equipment data");
            }
            throw error;
        }
    }

    public async update(id: string, data: Partial<Omit<Equipment, "id" | "createdAt" | "updatedAt">>): Promise<Equipment> {
        try {
            const equipment = await this.equipmentRepository.findOne({ 
                where: { id },
                relations: ["area"]
            });
            if (!equipment) {
                throw new EquipmentNotFoundError();
            }

            Object.assign(equipment, data);
            await this.equipmentRepository.save(equipment);
            return this.equipmentRepository.findOne({
                where: { id: equipment.id },
                relations: ["area"]
            }) as Promise<Equipment>;
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes('FOREIGN KEY')) {
                throw new InvalidForeignKeyError("Invalid area ID");
            }
            if (error instanceof QueryFailedError) {
                throw new InvalidDataError("Invalid equipment data");
            }
            throw error;
        }
    }

    public async delete(id: string): Promise<void> {
        const equipment = await this.equipmentRepository.findOne({ 
            where: { id },
            relations: ["parts"]
        });
        if (!equipment) {
            throw new EquipmentNotFoundError();
        }

        try {
            await this.equipmentRepository.remove(equipment);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new DependencyExistsError("Cannot delete equipment with associated parts");
            }
            throw error;
        }
    }
} 