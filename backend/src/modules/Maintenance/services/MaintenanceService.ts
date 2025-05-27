import {
  Maintenance,
  MaintenanceFrequencyType,
  MaintenanceReferenceType,
} from "../../../shared/models/Maintenance";
import { DatabaseContext } from "../../../config/database-context";
import { Repository, QueryFailedError, MoreThan } from "typeorm";
import { MaintenanceNotFoundError } from "../errors/MaintenanceNotFoundError";
import { InvalidDataError } from "../../../shared/errors/InvalidDataError";
import { InvalidForeignKeyError } from "../../../shared/errors/InvalidForeignKeyError";
import { Part } from "../../../shared/models/Part";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";

export class MaintenanceService {
  private maintenanceRepository: Repository<Maintenance>;
  private partRepository: Repository<Part>;

  constructor() {
    this.maintenanceRepository =
      DatabaseContext.getInstance().getRepository(Maintenance);
    this.partRepository = DatabaseContext.getInstance().getRepository(Part);
  }

  public async findAll(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      relations: ["part", "part.equipment", "equipment"],
    });
  }

  public async findAllFuture(): Promise<Maintenance[]> {
    // Find all maintenance records with next due date in the future or without a completed date
    return this.maintenanceRepository.find({
      where: [{ nextDueDate: MoreThan(new Date()) }, { isCompleted: false }],
      relations: ["part", "part.equipment", "equipment"],
      order: {
        nextDueDate: "ASC",
      },
    });
  }

  public async findById(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ["part", "part.equipment", "equipment"],
    });

    if (!maintenance) {
      throw new MaintenanceNotFoundError();
    }

    return maintenance;
  }

  public async create(
    data: Pick<
      Maintenance,
      | "frequencyType"
      | "frequencyValue"
      | "title"
      | "description"
      | "referenceType"
      | "partId"
    >
  ): Promise<Maintenance> {
    try {
      // Calculate the next due date based on frequency and reference
      const nextDueDate = await this.calculateNextDueDate(data);

      const maintenance = this.maintenanceRepository.create({
        ...data,
        nextDueDate,
      });

      return await this.maintenanceRepository.save(maintenance);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("FOREIGN KEY")
      ) {
        throw new InvalidForeignKeyError("Invalid part or equipment ID");
      }
      if (error instanceof QueryFailedError) {
        throw new InvalidDataError("Invalid maintenance data");
      }
      throw error;
    }
  }

  public async update(
    id: string,
    data: Partial<Omit<Maintenance, "id" | "createdAt" | "updatedAt">>
  ): Promise<Maintenance> {
    try {
      const maintenance = await this.findById(id);

      // Recalculate next due date if frequency or reference changed
      if (
        data.frequencyType !== undefined ||
        data.frequencyValue !== undefined ||
        data.referenceType !== undefined ||
        data.specificDate !== undefined ||
        data.partId !== undefined
      ) {
        const updatedData = {
          ...maintenance,
          ...data,
        };

        data.nextDueDate = await this.calculateNextDueDate(updatedData);
      }

      Object.assign(maintenance, data);
      return await this.maintenanceRepository.save(maintenance);
    } catch (error) {
      if (error instanceof MaintenanceNotFoundError) {
        throw error;
      }
      if (
        error instanceof QueryFailedError &&
        error.message.includes("FOREIGN KEY")
      ) {
        throw new InvalidForeignKeyError("Invalid part or equipment ID");
      }
      if (error instanceof QueryFailedError) {
        throw new InvalidDataError("Invalid maintenance data");
      }
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    const maintenance = await this.findById(id);
    await this.maintenanceRepository.remove(maintenance);
  }

  public async markComplete(
    id: string,
    completedDate: Date = new Date()
  ): Promise<Maintenance> {
    const maintenance = await this.findById(id);

    maintenance.isCompleted = true;
    maintenance.completedDate = completedDate;

    // Schedule next maintenance based on the completion date and frequency
    if (maintenance.frequencyType !== MaintenanceFrequencyType.SPECIFIC_DATE) {
      const nextMaintenanceData = {
        title: maintenance.title,
        description: maintenance.description,
        frequencyType: maintenance.frequencyType,
        frequencyValue: maintenance.frequencyValue,
        referenceType: maintenance.referenceType,
        partId: maintenance.partId,
        isCompleted: false,
      };

      // Create next maintenance instance
      await this.create(nextMaintenanceData);
    }

    return await this.maintenanceRepository.save(maintenance);
  }

  private async calculateNextDueDate(
    data: Partial<Maintenance>
  ): Promise<Date> {
    if (
      data.frequencyType === MaintenanceFrequencyType.SPECIFIC_DATE &&
      data.specificDate
    ) {
      return new Date(data.specificDate);
    }

    // Get reference date (either part installation date or equipment operation date)
    let referenceDate: Date;

    if (
      data.referenceType === MaintenanceReferenceType.PART_INSTALLATION &&
      data.partId
    ) {
      const part = await this.partRepository.findOne({
        where: { id: data.partId },
      });
      if (!part) {
        throw new InvalidForeignKeyError("Invalid part ID");
      }
      referenceDate = part.installationDate;
    } else if (
      data.referenceType === MaintenanceReferenceType.EQUIPMENT_OPERATION &&
      data.partId
    ) {
      const part = await this.partRepository.findOne({
        where: { id: data.partId },
        relations: ["equipment"],
      });
      if (!part) {
        throw new InvalidForeignKeyError("Invalid part ID");
      }
      if (!part.equipment) {
        throw new InvalidForeignKeyError(
          "Part is not associated with any equipment"
        );
      }
      referenceDate = part.equipment.initialOperationsDate;
    } else if (data.partId) {
      // Default to part installation date if available
      const part = await this.partRepository.findOne({
        where: { id: data.partId },
      });
      if (!part) {
        throw new InvalidForeignKeyError("Invalid part ID");
      }
      referenceDate = part.installationDate;
    } else if (data.partId) {
      // Default to equipment operation date if available
      const part = await this.partRepository.findOne({
        where: { id: data.partId },
        relations: ["equipment"],
      });
      if (!part) {
        throw new InvalidForeignKeyError("Invalid equipment ID");
      }
      if (!part.equipment) {
        throw new InvalidForeignKeyError(
          "Part is not associated with any equipment"
        );
      }
      referenceDate = part.equipment.initialOperationsDate;
    } else {
      throw new InvalidDataError("Missing part ID or equipment ID");
    }

    // Calculate next due date based on frequency
    const frequencyValue = data.frequencyValue || 0;
    const today = new Date();
    let nextDueDate: Date;

    switch (data.frequencyType) {
      case MaintenanceFrequencyType.DAYS:
        nextDueDate = addDays(referenceDate, Number(frequencyValue));
        break;
      case MaintenanceFrequencyType.WEEKS:
        nextDueDate = addWeeks(referenceDate, Number(frequencyValue));
        break;
      case MaintenanceFrequencyType.MONTHS:
        nextDueDate = addMonths(referenceDate, Number(frequencyValue));
        break;
      case MaintenanceFrequencyType.YEARS:
        nextDueDate = addYears(referenceDate, Number(frequencyValue));
        break;
      default:
        nextDueDate = addMonths(referenceDate, 3); // Default to 3 months if no frequency specified
    }

    // If the calculated date is in the past, add the interval again until we get a future date
    while (nextDueDate < today) {
      switch (data.frequencyType) {
        case MaintenanceFrequencyType.DAYS:
          nextDueDate = addDays(nextDueDate, Number(frequencyValue));
          break;
        case MaintenanceFrequencyType.WEEKS:
          nextDueDate = addWeeks(nextDueDate, Number(frequencyValue));
          break;
        case MaintenanceFrequencyType.MONTHS:
          nextDueDate = addMonths(nextDueDate, Number(frequencyValue));
          break;
        case MaintenanceFrequencyType.YEARS:
          nextDueDate = addYears(nextDueDate, Number(frequencyValue));
          break;
        default:
          nextDueDate = addMonths(nextDueDate, 3);
      }
    }

    return nextDueDate;
  }
}
