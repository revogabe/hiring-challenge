import { DataSource } from "typeorm";
import { Plant } from "../models/Plant";
import { Area } from "../models/Area";
import { Equipment } from "../models/Equipment";
import { Part } from "../models/Part";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "opwell.sqlite",
    synchronize: true, // Set to false in production
    logging: true,
    entities: [Plant, Area, Equipment, Part],
    migrations: [],
    subscribers: [],
}); 