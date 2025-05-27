import { DataSource } from "typeorm";
import { Area } from "../shared/models/Area";
import { Part } from "../shared/models/Part";
import { Equipment } from "../shared/models/Equipment";
import { Plant } from "../shared/models/Plant";
import { Maintenance } from "../shared/models/Maintenance";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "opwell.sqlite",
  synchronize: true, // Set to false in production
  logging: true,
  entities: [Plant, Area, Equipment, Part, Maintenance],
  migrations: [],
  subscribers: [],
});
