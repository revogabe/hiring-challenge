import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Area } from "./Area";
import { Part } from "./Part";

@Entity()
export class Equipment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  manufacturer!: string;

  @Column()
  serialNumber!: string;

  @Column({ type: "date" })
  initialOperationsDate!: Date;

  @ManyToMany(() => Area)
  @JoinTable({
    name: "area_equipment",
    joinColumn: { name: "equipment_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "area_id", referencedColumnName: "id" },
  })
  areas?: Area[];

  @OneToMany(() => Part, (part) => part.equipment)
  parts?: Part[];

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
