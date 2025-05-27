import { Repository, QueryFailedError } from "typeorm";
import { DatabaseContext } from "../../../config/database-context";
import { Part } from "../../../shared/models/Part";
import { InvalidForeignKeyError } from "../../../shared/errors/InvalidForeignKeyError";
import { InvalidDataError } from "../../../shared/errors/InvalidDataError";
import { DependencyExistsError } from "../../../shared/errors/DependencyExistsError";
import { PartNotFoundError } from "../errors/PartNotFoundError";

export class PartService {
  private partRepository: Repository<Part>;

  constructor() {
    this.partRepository = DatabaseContext.getInstance().getRepository(Part);
  }

  public async findAll(): Promise<Part[]> {
    return this.partRepository.find({
      relations: ["equipment"],
    });
  }

  public async findById(id: string): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { id },
      relations: ["equipment"],
    });
    if (!part) {
      throw new PartNotFoundError();
    }
    return part;
  }

  public async create(
    data: Partial<Omit<Part, "id" | "createdAt" | "updatedAt">>
  ): Promise<Part> {
    try {
      const part = this.partRepository.create(data);
      const savedPart = await this.partRepository.save(part);
      return this.partRepository.findOne({
        where: { id: savedPart.id },
        relations: ["equipment"],
      }) as Promise<Part>;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("FOREIGN KEY")
      ) {
        throw new InvalidForeignKeyError("Invalid equipment ID");
      }
      if (
        error instanceof QueryFailedError &&
        error.message.includes("part_type_check")
      ) {
        throw new InvalidDataError("Invalid part type");
      }
      if (error instanceof QueryFailedError) {
        throw new InvalidDataError("Invalid part data");
      }
      throw error;
    }
  }

  public async update(
    id: string,
    data: Partial<Omit<Part, "id" | "createdAt" | "updatedAt">>
  ): Promise<Part> {
    try {
      const part = await this.partRepository.findOne({
        where: { id },
        relations: ["equipment"],
      });
      if (!part) {
        throw new PartNotFoundError();
      }

      Object.assign(part, data);
      await this.partRepository.save(part);
      return this.partRepository.findOne({
        where: { id: part.id },
        relations: ["equipment"],
      }) as Promise<Part>;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("FOREIGN KEY")
      ) {
        throw new InvalidForeignKeyError("Invalid equipment ID");
      }
      if (
        error instanceof QueryFailedError &&
        error.message.includes("part_type_check")
      ) {
        throw new InvalidDataError("Invalid part type");
      }
      if (error instanceof QueryFailedError) {
        throw new InvalidDataError("Invalid part data");
      }
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    const part = await this.partRepository.findOne({ where: { id } });
    if (!part) {
      throw new PartNotFoundError();
    }

    try {
      await this.partRepository.remove(part);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new DependencyExistsError("Cannot delete part with dependencies");
      }
      throw error;
    }
  }
}
