import { AreaService } from "../../src/services/AreaService";
import { DatabaseContext } from "../../src/config/database-context";
import { Area } from "../../src/models/Area";
import { Repository, QueryFailedError } from "typeorm";
import { AreaNotFoundError } from "../../src/errors/AreaNotFoundError";
import { InvalidForeignKeyError } from "../../src/errors/InvalidForeignKeyError";
import { InvalidDataError } from "../../src/errors/InvalidDataError";
import { DependencyExistsError } from "../../src/errors/DependencyExistsError";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("../../src/config/database-context");

describe("AreaService", () => {
    let areaService: AreaService;
    let mockRepository: jest.Mocked<Repository<Area>>;

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

        areaService = new AreaService();
    });

    describe("findAll", () => {
        it("should return all areas with their relations", async () => {
            const mockAreas = [{
                id: "1",
                name: "Area 1",
                locationDescription: "Location 1",
                plantId: "plant1",
                createdAt: new Date(),
                updatedAt: new Date()
            }];
            mockRepository.find.mockResolvedValue(mockAreas);

            const result = await areaService.findAll();

            expect(result).toEqual(mockAreas);
            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ["plant", "equipment", "equipment.parts"]
            });
        });
    });

    describe("findById", () => {
        it("should return an area when found", async () => {
            const mockArea = {
                id: "1",
                name: "Area 1",
                locationDescription: "Location 1",
                plantId: "plant1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockArea);

            const result = await areaService.findById("1");

            expect(result).toEqual(mockArea);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: "1" },
                relations: ["plant", "equipment", "equipment.parts"]
            });
        });

        it("should throw AreaNotFoundError when area doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(areaService.findById("1"))
                .rejects
                .toThrow(AreaNotFoundError);
        });
    });

    describe("create", () => {
        const mockCreatedAt = new Date();
        const mockUpdatedAt = new Date();
        const areaData = {
            name: "New Area",
            locationDescription: "Location 1",
            plantId: "plant1"
        };

        it("should create and return a new area", async () => {
            const mockArea = {
                ...areaData,
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.create.mockReturnValue(mockArea);
            mockRepository.save.mockResolvedValue(mockArea);
            mockRepository.findOne.mockResolvedValue(mockArea);

            const result = await areaService.create(areaData);

            expect(result).toEqual(mockArea);
            expect(mockRepository.create).toHaveBeenCalledWith(areaData);
            expect(mockRepository.save).toHaveBeenCalledWith(mockArea);
        });

        it("should throw InvalidForeignKeyError when save fails with foreign key error", async () => {
            const mockArea = {
                ...areaData,
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            const queryError = new QueryFailedError("query", undefined, new Error("FOREIGN KEY"));
            mockRepository.create.mockReturnValue(mockArea);
            mockRepository.save.mockRejectedValue(queryError);

            await expect(areaService.create(areaData))
                .rejects
                .toThrow(InvalidForeignKeyError);
        });

        it("should throw InvalidDataError when save fails with other QueryFailedError", async () => {
            const mockArea = {
                ...areaData,
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.create.mockReturnValue(mockArea);
            mockRepository.save.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(areaService.create(areaData))
                .rejects
                .toThrow(InvalidDataError);
        });
    });

    describe("update", () => {
        const areaId = "1";
        const updateData = { name: "Updated Area" };
        const mockCreatedAt = new Date();
        const mockUpdatedAt = new Date();

        it("should update and return the area", async () => {
            const existingArea = {
                id: areaId,
                name: "Old Name",
                locationDescription: "Location 1",
                plantId: "plant1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            const updatedArea = { ...existingArea, ...updateData };
            mockRepository.findOne.mockResolvedValue(existingArea);
            mockRepository.save.mockResolvedValue(updatedArea);

            const result = await areaService.update(areaId, updateData);

            expect(result).toEqual(updatedArea);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedArea);
        });

        it("should throw AreaNotFoundError when area doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(areaService.update(areaId, updateData))
                .rejects
                .toThrow(AreaNotFoundError);
        });

        it("should throw InvalidDataError when save fails with QueryFailedError", async () => {
            const existingArea = {
                id: areaId,
                name: "Old Name",
                locationDescription: "Location 1",
                plantId: "plant1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.findOne.mockResolvedValue(existingArea);
            mockRepository.save.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(areaService.update(areaId, updateData))
                .rejects
                .toThrow(InvalidDataError);
        });
    });

    describe("delete", () => {
        const areaId = "1";

        it("should delete the area successfully", async () => {
            const mockArea = {
                id: areaId,
                name: "Area to Delete",
                locationDescription: "Location 1",
                plantId: "plant1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockArea);
            mockRepository.remove.mockResolvedValue(mockArea);

            await areaService.delete(areaId);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockArea);
        });

        it("should throw AreaNotFoundError when area doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(areaService.delete(areaId))
                .rejects
                .toThrow(AreaNotFoundError);
        });

        it("should throw DependencyExistsError when delete fails with QueryFailedError", async () => {
            const mockArea = {
                id: areaId,
                name: "Area with Dependencies",
                locationDescription: "Location 1",
                plantId: "plant1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockArea);
            mockRepository.remove.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(areaService.delete(areaId))
                .rejects
                .toThrow(DependencyExistsError);
        });
    });
}); 