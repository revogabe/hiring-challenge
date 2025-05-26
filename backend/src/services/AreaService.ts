import { Area } from "../models/Area";
import { Plant } from "../models/Plant";
import { DatabaseContext } from "../config/database-context";
import { Repository, QueryFailedError, In } from "typeorm";
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
    data: Pick<Area, "name" | "locationDescription" | "plantId"> & {
      neighborIDs?: string[];
    }
  ): Promise<Area> {
    try {
      const { neighborIDs = [] } = data;

      const neighbors = await this.areaRepository.find({
        where: { id: In(neighborIDs) },
      });

      const plant = await this.plantRepository.findOne({
        where: { id: data.plantId },
      });

      if (!plant) {
        throw new InvalidForeignKeyError("Invalid plant ID");
      }
      if (neighbors.length !== neighborIDs.length) {
        throw new AreaNotFoundError("One or more neighbor areas not found");
      }

      const area = this.areaRepository.create({
        ...data,
        plant,
        neighbors,
      });

      if (!area) {
        throw new AreaNotFoundError("Area could not be created");
      }

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
    data: Partial<Pick<Area, "name" | "locationDescription" | "plantId">> & {
      neighborIDs?: string[];
    }
  ): Promise<Area> {
    try {
      const { plantId, neighborIDs, ...cleanData } = data;

      const area = await this.areaRepository.findOne({
        where: { id },
        relations: ["plant", "neighbors"],
      });

      if (!area) {
        throw new AreaNotFoundError();
      }

      Object.assign(area, cleanData);
      const areasToSave: Area[] = [area];

      if (neighborIDs !== undefined) {
        if (!area.neighbors) {
          area.neighbors = [];
        }

        const currentNeighborIds = new Set(area.neighbors.map((n) => n.id));

        if (neighborIDs.length > 0) {
          const newNeighbors = await this.areaRepository.find({
            where: { id: In(neighborIDs) },
            relations: ["plant", "neighbors"],
          });

          if (newNeighbors.length !== neighborIDs.length) {
            throw new AreaNotFoundError("One or more neighbor areas not found");
          }
          if (newNeighbors.some((n) => n.plantId !== area.plantId)) {
            throw new InvalidForeignKeyError(
              "Cannot link neighbors from different plants"
            );
          }

          const neighborsToRemoveIds = [...currentNeighborIds].filter(
            (id) => !neighborIDs.includes(id)
          );

          const neighborsToRemove = await this.areaRepository.find({
            where: { id: In(neighborsToRemoveIds) },
            relations: ["neighbors"],
          });

          for (const neighbor of neighborsToRemove) {
            if (neighbor.neighbors) {
              neighbor.neighbors = neighbor.neighbors.filter(
                (n) => n.id !== area.id
              );
              areasToSave.push(neighbor);
            }
          }

          area.neighbors = area.neighbors.filter(
            (n) => !neighborsToRemoveIds.includes(n.id)
          );

          for (const newNeighbor of newNeighbors) {
            if (currentNeighborIds.has(newNeighbor.id)) {
              continue;
            }

            area.neighbors.push(newNeighbor);

            if (!newNeighbor.neighbors) {
              newNeighbor.neighbors = [];
            }

            if (!newNeighbor.neighbors.some((n) => n.id === area.id)) {
              newNeighbor.neighbors.push(area);
            }

            areasToSave.push(newNeighbor);
          }
        } else {
          const allCurrentNeighbors = await this.areaRepository.find({
            where: { id: In([...currentNeighborIds]) },
            relations: ["neighbors"],
          });

          for (const neighbor of allCurrentNeighbors) {
            if (neighbor.neighbors) {
              neighbor.neighbors = neighbor.neighbors.filter(
                (n) => n.id !== area.id
              );
              areasToSave.push(neighbor);
            }
          }

          area.neighbors = [];
        }
      }

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

      await this.areaRepository.save(areasToSave);
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
