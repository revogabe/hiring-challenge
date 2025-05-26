import { Area } from "../models/Area";
import { Plant } from "../models/Plant";
import { DatabaseContext } from "../config/database-context";
import { Repository, QueryFailedError } from "typeorm";
import { AreaNotFoundError } from "../errors/AreaNotFoundError";
import { InvalidForeignKeyError } from "../errors/InvalidForeignKeyError";
import { InvalidDataError } from "../errors/InvalidDataError";
import { DependencyExistsError } from "../errors/DependencyExistsError";

export class AreaService {
  private areaRepository: Repository<Area>;
  private plantRepository: Repository<Plant>;

  constructor() {
    this.areaRepository = DatabaseContext.getInstance().getRepository(Area);
    this.plantRepository = DatabaseContext.getInstance().getRepository(Plant);
  }

  public async findAll(): Promise<Area[]> {
    return this.areaRepository.find({
      relations: ["plant", "equipment", "equipment.parts", "neighbors"],
    });
  }

  public async findById(id: string): Promise<Area> {
    const area = await this.areaRepository.findOne({
      where: { id },
      relations: ["plant", "equipment", "equipment.parts", "neighbors"],
    });
    if (!area) {
      throw new AreaNotFoundError();
    }
    return area;
  }

  public async create(
    data: Pick<Area, "name" | "locationDescription" | "plantId">
  ): Promise<Area> {
    try {
      const plant = await this.plantRepository.findOne({
        where: { id: data.plantId },
      });

      if (!plant) {
        throw new InvalidForeignKeyError("Invalid plant ID");
      }

      const area = this.areaRepository.create({
        ...data,
        plant,
      });

      const savedArea = await this.areaRepository.save(area);
      return this.areaRepository.findOne({
        where: { id: savedArea.id },
        relations: ["plant", "neighbors"],
      }) as Promise<Area>;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("FOREIGN KEY")
      ) {
        throw new InvalidForeignKeyError("Invalid plant ID");
      }
      if (error instanceof QueryFailedError) {
        throw new InvalidDataError("Invalid area data");
      }
      throw error;
    }
  }

  public async update(
    id: string,
    data: Partial<Pick<Area, "name" | "locationDescription" | "plantId">>
  ): Promise<Area> {
    try {
      const { plantId, ...cleanData } = data;
      const area = await this.areaRepository.findOne({
        where: { id },
        relations: ["plant", "neighbors"],
      });
      if (!area) {
        throw new AreaNotFoundError();
      }

      Object.assign(area, cleanData);

      if (plantId) {
        const plant = await this.plantRepository.findOne({
          where: { id: plantId },
          relations: ["areas"],
        });
        if (!plant) {
          throw new InvalidForeignKeyError("Invalid plant ID");
        }

        area.plant = plant;
        area.plantId = plant.id;
      }

      await this.areaRepository.save(area);
      return this.areaRepository.findOne({
        where: { id: area.id },
        relations: ["plant", "neighbors"],
      }) as Promise<Area>;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new InvalidDataError("Invalid area data");
      }
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    const area = await this.areaRepository.findOne({
      where: { id },
      relations: ["equipment", "neighbors"],
    });
    if (!area) {
      throw new AreaNotFoundError();
    }

    try {
      await this.areaRepository
        .createQueryBuilder()
        .delete()
        .from("area_neighbors")
        .where("area_id = :id OR neighbor_id = :id", { id })
        .execute();

      await this.areaRepository.remove(area);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new DependencyExistsError(
          "Cannot delete area with associated equipment"
        );
      }
      throw error;
    }
  }
}
