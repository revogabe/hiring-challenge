import { Equipment } from "../../../shared/models/Equipment";
import { Area } from "../../../shared/models/Area";
import { DatabaseContext } from "../../../config/database-context";
import { Repository, QueryFailedError, In } from "typeorm";
import { EquipmentNotFoundError } from "../errors/EquipmentNotFoundError";
import { InvalidForeignKeyError } from "../../../shared/errors/InvalidForeignKeyError";
import { InvalidDataError } from "../../../shared/errors/InvalidDataError";
import { DependencyExistsError } from "../../../shared/errors/DependencyExistsError";

export class EquipmentService {
  private equipmentRepository: Repository<Equipment>;
  private areaRepository: Repository<Area>;

  constructor() {
    this.equipmentRepository =
      DatabaseContext.getInstance().getRepository(Equipment);
    this.areaRepository = DatabaseContext.getInstance().getRepository(Area);
  }

  public async findAll(): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      relations: ["areas", "parts"],
    });
  }

  public async findById(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      relations: ["areas", "parts"],
    });
    if (!equipment) {
      throw new EquipmentNotFoundError();
    }
    return equipment;
  }

  public async create(
    data: Omit<Equipment, "id" | "createdAt" | "updatedAt" | "areas"> & {
      areaIDs: string[];
    }
  ): Promise<Equipment> {
    try {
      if (!data.areaIDs || data.areaIDs.length === 0) {
        throw new InvalidDataError(
          "Equipment must be associated with at least one area"
        );
      }

      const areas = await this.areaRepository.find({
        where: { id: In(data.areaIDs) },
        relations: ["neighbors"],
      });

      if (areas.length !== data.areaIDs.length) {
        throw new InvalidDataError("One or more area IDs are invalid");
      }

      await this.validateAreasConnectivity(areas);

      const { areaIDs, ...equipmentData } = data;

      const equipment = this.equipmentRepository.create(equipmentData);
      equipment.areas = areas;
      const savedEquipment = await this.equipmentRepository.save(equipment);

      return this.equipmentRepository.findOne({
        where: { id: savedEquipment.id },
        relations: ["areas", "parts"],
      }) as Promise<Equipment>;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("FOREIGN KEY")
      ) {
        throw new InvalidForeignKeyError("Invalid area ID");
      }
      if (error instanceof QueryFailedError) {
        throw new InvalidDataError("Invalid equipment data");
      }
      throw error;
    }
  }

  public async update(
    id: string,
    data: Partial<
      Omit<Equipment, "id" | "createdAt" | "updatedAt" | "areas"> & {
        areaIDs?: string[];
      }
    >
  ): Promise<Equipment> {
    try {
      const equipment = await this.equipmentRepository.findOne({
        where: { id },
        relations: ["areas"],
      });

      if (!equipment) {
        throw new EquipmentNotFoundError();
      }

      const { areaIDs, ...equipmentData } = data;
      Object.assign(equipment, equipmentData);

      if (areaIDs && areaIDs.length > 0) {
        const areas = await this.areaRepository.find({
          where: { id: In(areaIDs) },
          relations: ["neighbors"],
        });

        if (areas.length !== areaIDs.length) {
          throw new InvalidDataError("One or more area IDs are invalid");
        }

        await this.validateAreasConnectivity(areas);

        equipment.areas = areas;
      }

      await this.equipmentRepository.save(equipment);
      return this.equipmentRepository.findOne({
        where: { id: equipment.id },
        relations: ["areas", "parts"],
      }) as Promise<Equipment>;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("FOREIGN KEY")
      ) {
        throw new InvalidForeignKeyError("Invalid area ID");
      }
      if (error instanceof QueryFailedError) {
        throw new InvalidDataError("Invalid equipment data");
      }
      throw error;
    }
  }

  private async validateAreasConnectivity(areas: Area[]): Promise<void> {
    if (areas.length <= 1) return;

    const neighborMap = new Map<string, Set<string>>();

    areas.forEach((area) => {
      neighborMap.set(area.id, new Set());
    });

    areas.forEach((area) => {
      if (!area.neighbors) return;

      const relevantNeighbors = area.neighbors.filter((n) =>
        areas.some((a) => a.id === n.id)
      );

      relevantNeighbors.forEach((neighbor) => {
        neighborMap.get(area.id)?.add(neighbor.id);
      });
    });

    const visited = new Set<string>();
    const firstAreaId = areas[0].id;
    const queue = [firstAreaId];
    visited.add(firstAreaId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const neighbors = neighborMap.get(currentId);

      if (!neighbors) continue;

      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      });
    }

    if (visited.size !== areas.length) {
      throw new InvalidDataError(
        "All areas associated with an equipment must form a connected group of neighbors"
      );
    }
  }

  public async delete(id: string): Promise<void> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      relations: ["parts"],
    });
    if (!equipment) {
      throw new EquipmentNotFoundError();
    }

    try {
      await this.equipmentRepository.remove(equipment);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new DependencyExistsError(
          "Cannot delete equipment with associated parts"
        );
      }
      throw error;
    }
  }
}
