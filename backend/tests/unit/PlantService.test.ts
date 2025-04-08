import { PlantService } from "../../src/services/PlantService";
import { DatabaseContext } from "../../src/config/database-context";
import { Plant } from "../../src/models/Plant";
import { Repository, QueryFailedError } from "typeorm";
import { PlantNotFoundError } from "../../src/errors/PlantNotFoundError";
import { InvalidDataError } from "../../src/errors/InvalidDataError";
import { DependencyExistsError } from "../../src/errors/DependencyExistsError";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("../../src/config/database-context");

describe("PlantService", () => {
    let plantService: PlantService;
    let mockRepository: jest.Mocked<Repository<Plant>>;

    beforeEach(() => {
        mockRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
        } as any;

        (DatabaseContext.getInstance as jest.Mock).mockReturnValue({
            getRepository: jest.fn().mockReturnValue(mockRepository)
        });

        plantService = new PlantService();
    });

    describe("findAll", () => {
        it("should return all plants with their relations", async () => {
            const mockPlants = [{
                id: "1",
                name: "Plant 1",
                address: "123 Test St",
                createdAt: new Date(),
                updatedAt: new Date()
            }];
            mockRepository.find.mockResolvedValue(mockPlants);

            const result = await plantService.findAll();

            expect(result).toEqual(mockPlants);
            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ["areas", "areas.equipment"]
            });
        });
    });

    describe("findById", () => {
        it("should return a plant when found", async () => {
            const mockPlant = {
                id: "1",
                name: "Plant 1",
                address: "123 Test St",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockPlant);

            const result = await plantService.findById("1");

            expect(result).toEqual(mockPlant);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: "1" },
                relations: ["areas", "areas.equipment"]
            });
        });

        it("should throw PlantNotFoundError when plant doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(plantService.findById("1"))
                .rejects
                .toThrow(PlantNotFoundError);
        });
    });

    describe("create", () => {
        const mockCreatedAt = new Date();
        const mockUpdatedAt = new Date();
        
        it("should create and return a new plant", async () => {
            const plantData = { name: "New Plant", address: "123 St" };
            const mockPlant = {
                ...plantData,
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.create.mockReturnValue(mockPlant);
            mockRepository.save.mockResolvedValue(mockPlant);

            const result = await plantService.create(plantData);

            expect(result).toEqual(mockPlant);
            expect(mockRepository.create).toHaveBeenCalledWith(plantData);
            expect(mockRepository.save).toHaveBeenCalledWith(mockPlant);
        });

        it("should throw InvalidDataError when save fails with QueryFailedError", async () => {
            const plantData = { name: "New Plant", address: "123 St" };
            const mockPlant = {
                ...plantData,
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.create.mockReturnValue(mockPlant);
            mockRepository.save.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(plantService.create(plantData))
                .rejects
                .toThrow(InvalidDataError);
        });
    });

    describe("update", () => {
        const plantId = "1";
        const updateData = { name: "Updated Plant" };
        const mockCreatedAt = new Date();
        const mockUpdatedAt = new Date();

        it("should update and return the plant", async () => {
            const existingPlant = {
                id: plantId,
                name: "Old Name",
                address: "123 Test St",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            const updatedPlant = { ...existingPlant, ...updateData };
            mockRepository.findOne.mockResolvedValue(existingPlant);
            mockRepository.save.mockResolvedValue(updatedPlant);

            const result = await plantService.update(plantId, updateData);

            expect(result).toEqual(updatedPlant);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedPlant);
        });

        it("should throw PlantNotFoundError when plant doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(plantService.update(plantId, updateData))
                .rejects
                .toThrow(PlantNotFoundError);
        });

        it("should throw InvalidDataError when save fails with QueryFailedError", async () => {
            const existingPlant = {
                id: plantId,
                name: "Old Name",
                address: "123 Test St",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.findOne.mockResolvedValue(existingPlant);
            mockRepository.save.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(plantService.update(plantId, updateData))
                .rejects
                .toThrow(InvalidDataError);
        });
    });

    describe("delete", () => {
        const plantId = "1";

        it("should delete the plant successfully", async () => {
            const mockPlant = {
                id: plantId,
                name: "Plant to Delete",
                address: "123 Test St",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockPlant);
            mockRepository.remove.mockResolvedValue(mockPlant);

            await plantService.delete(plantId);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockPlant);
        });

        it("should throw PlantNotFoundError when plant doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(plantService.delete(plantId))
                .rejects
                .toThrow(PlantNotFoundError);
        });

        it("should throw DependencyExistsError when delete fails with QueryFailedError", async () => {
            const mockPlant = {
                id: plantId,
                name: "Plant with Dependencies",
                address: "123 Test St",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockPlant);
            mockRepository.remove.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(plantService.delete(plantId))
                .rejects
                .toThrow(DependencyExistsError);
        });
    });
}); 