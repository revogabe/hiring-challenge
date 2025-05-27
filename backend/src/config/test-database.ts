import { DataSource } from "typeorm";
import { Plant } from "../shared/models/Plant";
import { Area } from "../shared/models/Area";
import { Equipment } from "../shared/models/Equipment";
import { Part } from "../shared/models/Part";

export const TestDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  synchronize: true,
  logging: true,
  entities: [Plant, Area, Equipment, Part],
  migrations: [],
  subscribers: [],
});
