import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Equipment } from "./Equipment";
import { Maintenance } from "./Maintenance";

export enum PartType {
  ELECTRIC = "electric",
  ELECTRONIC = "electronic",
  MECHANICAL = "mechanical",
  HYDRAULICAL = "hydraulical",
}

@Entity()
export class Part {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: "varchar",
    default: PartType.MECHANICAL,
  })
  type!: PartType;

  @Column()
  manufacturer!: string;

  @Column()
  serialNumber!: string;

  @Column({ type: "date" })
  installationDate!: Date;

  @ManyToOne(() => Equipment, (equipment) => equipment.parts)
  equipment?: Equipment;

  @Column()
  equipmentId!: string;

  @OneToMany(() => Maintenance, (maintenance) => maintenance.part)
  maintenance?: Maintenance[];

  @Column()
  maintenanceId!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
