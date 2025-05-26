import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Plant } from "./Plant";
import { Equipment } from "./Equipment";

@Entity()
export class Area {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  locationDescription!: string;

  @ManyToOne(() => Plant, (plant) => plant.areas)
  plant?: Plant;

  @Column()
  plantId!: string;

  @ManyToMany(() => Equipment)
  @JoinTable({
    name: "area_equipment",
    joinColumn: { name: "area_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "equipment_id", referencedColumnName: "id" },
  })
  equipment?: Equipment[];

  @ManyToMany(() => Area)
  @JoinTable({
    name: "area_neighbors",
    joinColumn: { name: "area_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "neighbor_id", referencedColumnName: "id" },
  })
  neighbors?: Area[];

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
