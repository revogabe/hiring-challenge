import { DataSource, Repository, EntityTarget, ObjectLiteral } from "typeorm";
import { AppDataSource } from "./database";
import { TestDataSource } from "./test-database";

export class DatabaseContext {
    private static instance: DatabaseContext;
    private dataSource: DataSource;

    private constructor() {
        this.dataSource = process.env.NODE_ENV === 'test' ? TestDataSource : AppDataSource;
    }

    public static getInstance(): DatabaseContext {
        if (!DatabaseContext.instance) {
            DatabaseContext.instance = new DatabaseContext();
        }
        return DatabaseContext.instance;
    }

    public getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
        return this.dataSource.getRepository(entity);
    }

    // For testing purposes only
    public static setTestInstance(testDataSource: DataSource) {
        DatabaseContext.instance = new DatabaseContext();
        DatabaseContext.instance.dataSource = testDataSource;
    }
} 