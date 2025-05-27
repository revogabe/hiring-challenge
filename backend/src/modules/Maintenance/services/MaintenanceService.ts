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
      relations: ["part", "part.equipment"],
    });
  }

  public async findAllFuture(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: [{ nextDueDate: MoreThan(new Date()) }, { isCompleted: false }],
      relations: ["part", "part.equipment"],
      order: {
        nextDueDate: "ASC",
      },
    });
  }

  public async findById(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ["part", "part.equipment"],
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

      const updatedData = {
        ...maintenance,
        ...data,
      };

      data.nextDueDate = await this.calculateNextDueDate(updatedData);

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
    data: { completedDate?: string | Date }
  ): Promise<Maintenance> {
    const maintenance = await this.findById(id);

    maintenance.isCompleted = true;
    maintenance.completedDate = new Date(data.completedDate || new Date());

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

    const today = new Date();
    const referenceDate = await this.getMaintenanceReferenceDate(data);
    const frequencyValue = Number(data.frequencyValue || 0);

    let nextDueDate = this.calculateInitialDueDate(
      referenceDate,
      data.frequencyType,
      frequencyValue
    );

    while (nextDueDate < today) {
      nextDueDate = this.addTimeByFrequencyType(
        nextDueDate,
        data.frequencyType,
        frequencyValue
      );
    }

    return nextDueDate;
  }

  private async getMaintenanceReferenceDate(
    data: Partial<Maintenance>
  ): Promise<Date> {
    if (!data.partId) {
      throw new InvalidDataError("Missing part ID");
    }

    const partQuery: { where: { id: string }; relations?: string[] } = {
      where: { id: data.partId },
    };

    if (data.referenceType === MaintenanceReferenceType.EQUIPMENT_OPERATION) {
      partQuery.relations = ["equipment"];
    }

    const part = await this.partRepository.findOne(partQuery);

    if (!part) {
      throw new InvalidForeignKeyError("Invalid part ID");
    }

    if (data.referenceType === MaintenanceReferenceType.EQUIPMENT_OPERATION) {
      if (!part.equipment) {
        throw new InvalidForeignKeyError(
          "Part is not associated with any equipment"
        );
      }
      return part.equipment.initialOperationsDate;
    }

    return part.installationDate;
  }

  private calculateInitialDueDate(
    referenceDate: Date,
    frequencyType?: MaintenanceFrequencyType,
    frequencyValue: number = 0
  ): Date {
    switch (frequencyType) {
      case MaintenanceFrequencyType.DAYS:
        return addDays(referenceDate, frequencyValue);
      case MaintenanceFrequencyType.WEEKS:
        return addWeeks(referenceDate, frequencyValue);
      case MaintenanceFrequencyType.MONTHS:
        return addMonths(referenceDate, frequencyValue);
      case MaintenanceFrequencyType.YEARS:
        return addYears(referenceDate, frequencyValue);
      default:
        return addMonths(referenceDate, 3);
    }
  }

  private addTimeByFrequencyType(
    date: Date,
    frequencyType?: MaintenanceFrequencyType,
    frequencyValue: number = 0
  ): Date {
    return this.calculateInitialDueDate(date, frequencyType, frequencyValue);
  }
}
