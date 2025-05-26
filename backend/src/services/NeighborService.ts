import { Area } from "../models/Area";
import { DatabaseContext } from "../config/database-context";
import { In, Repository } from "typeorm";
import { AreaNotFoundError } from "../errors/AreaNotFoundError";
import { NeighboringAreaError } from "../errors/NeighboringAreaError";

export class NeighborService {
  private areaRepository: Repository<Area>;

  constructor() {
    this.areaRepository = DatabaseContext.getInstance().getRepository(Area);
  }

  public async addNeighbor(
    areaId: string,
    neighborIds: string[]
  ): Promise<void> {
    if (neighborIds.includes(areaId)) {
      throw new NeighboringAreaError();
    }

    const area = await this.areaRepository.findOne({
      where: { id: areaId },
      relations: ["neighbors"],
    });

    const neighbors = await this.areaRepository.find({
      where: { id: In(neighborIds) },
      relations: ["neighbors"],
    });

    if (!area) {
      throw new AreaNotFoundError();
    }
    if (!area.neighbors) {
      area.neighbors = [];
    }
    if (neighbors.length !== neighborIds.length) {
      throw new AreaNotFoundError("One or more neighbor areas not found");
    }

    const areasToSave: Area[] = [area];
    const existingNeighborIds = new Set(area.neighbors.map((n) => n.id));

    const newNeighbors = neighbors.filter(
      (neighbor) => !existingNeighborIds.has(neighbor.id)
    );

    area.neighbors.push(...newNeighbors);

    newNeighbors.forEach((neighbor) => {
      if (!neighbor.neighbors) {
        neighbor.neighbors = [];
      }
      if (!neighbor.neighbors.some((n) => n.id === area.id)) {
        neighbor.neighbors.push(area);
      }

      areasToSave.push(neighbor);
    });

    await this.areaRepository.save(areasToSave);
  }

  public async removeNeighbor(
    areaId: string,
    neighborIds: string[]
  ): Promise<void> {
    const area = await this.areaRepository.findOne({
      where: { id: areaId },
      relations: ["neighbors"],
    });

    const neighbors = await this.areaRepository.find({
      where: { id: In(neighborIds) },
      relations: ["neighbors"],
    });

    if (!area) {
      throw new AreaNotFoundError();
    }
    if (!area.neighbors || area.neighbors.length === 0) {
      return;
    }

    const areasToSave: Area[] = [area];

    area.neighbors = area.neighbors.filter((n) => !neighborIds.includes(n.id));

    const neighborsToUpdate = neighbors
      .filter((neighbor) => neighbor?.neighbors?.some((n) => n.id === areaId))
      .map((neighbor) => {
        if (neighbor.neighbors) {
          neighbor.neighbors = neighbor.neighbors.filter(
            (n) => n.id !== areaId
          );
        }
        return neighbor;
      });

    areasToSave.push(...neighborsToUpdate);

    await this.areaRepository.save(areasToSave);
  }

  public async getNeighbors(areaId: string): Promise<Area[]> {
    const area = await this.areaRepository.findOne({
      where: { id: areaId },
      relations: ["neighbors", "neighbors.plant"],
    });

    if (!area) {
      throw new AreaNotFoundError();
    }

    return area.neighbors || [];
  }
}
