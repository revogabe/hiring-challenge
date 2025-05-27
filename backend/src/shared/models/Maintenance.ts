import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Part } from "./Part";

export enum MaintenanceFrequencyType {
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
  YEARS = "years",
  SPECIFIC_DATE = "specific_date",
}

export enum MaintenanceReferenceType {
  PART_INSTALLATION = "part_installation",
  EQUIPMENT_OPERATION = "equipment_operation",
}

@Entity()
export class Maintenance {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: "varchar",
    default: MaintenanceFrequencyType.MONTHS,
  })
  frequencyType!: MaintenanceFrequencyType;

  @Column()
  frequencyValue!: string;

  @Column({
    type: "varchar",
    default: MaintenanceReferenceType.PART_INSTALLATION,
  })
  referenceType!: MaintenanceReferenceType;

  @Column({ type: "date", nullable: true })
  specificDate?: Date;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ type: "date", nullable: true })
  completedDate?: Date;

  @ManyToOne(() => Part, (part) => part.maintenance)
  part!: Part;

  @Column()
  partId!: string;

  @Column({ type: "date", nullable: true })
  nextDueDate?: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
  maintenance: { completedDate: Date };
}
