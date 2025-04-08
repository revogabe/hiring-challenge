import { PartService } from "../../src/services/PartService";
import { DatabaseContext } from "../../src/config/database-context";
import { Part } from "../../src/models/Part";
import { PartType } from "../../src/models/Part";
import { Repository, QueryFailedError } from "typeorm";
import { PartNotFoundError } from "../../src/errors/PartNotFoundError";
import { InvalidForeignKeyError } from "../../src/errors/InvalidForeignKeyError";
import { InvalidDataError } from "../../src/errors/InvalidDataError";
import { DependencyExistsError } from "../../src/errors/DependencyExistsError";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
jest.mock("../../src/config/database-context");

describe("PartService", () => {
    let partService: PartService;
    let mockRepository: jest.Mocked<Repository<Part>>;

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

        partService = new PartService();
    });

    describe("findAll", () => {
        it("should return all parts with their relations", async () => {
            const mockParts = [{
                id: "1",
                name: "Part 1",
                type: PartType.MECHANICAL,
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                installationDate: new Date(),
                equipmentId: "equipment1",
                createdAt: new Date(),
                updatedAt: new Date()
            }];
            mockRepository.find.mockResolvedValue(mockParts);

            const result = await partService.findAll();

            expect(result).toEqual(mockParts);
            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ["equipment"]
            });
        });
    });

    describe("findById", () => {
        it("should return a part when found", async () => {
            const mockPart = {
                id: "1",
                name: "Part 1",
                type: PartType.MECHANICAL,
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                installationDate: new Date(),
                equipmentId: "equipment1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockPart);

            const result = await partService.findById("1");

            expect(result).toEqual(mockPart);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: "1" },
                relations: ["equipment"]
            });
        });

        it("should throw PartNotFoundError when part doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(partService.findById("1"))
                .rejects
                .toThrow(PartNotFoundError);
        });
    });

    describe("create", () => {
        const mockCreatedAt = new Date();
        const mockUpdatedAt = new Date();
        const partData = {
            name: "New Part",
            type: PartType.MECHANICAL,
            manufacturer: "Test Manufacturer",
            serialNumber: "123456",
            installationDate: new Date(),
            equipmentId: "equipment1"
        };

        it("should create and return a new part", async () => {
            const mockPart = { 
                ...partData, 
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.create.mockReturnValue(mockPart);
            mockRepository.save.mockResolvedValue(mockPart);
            mockRepository.findOne.mockResolvedValue(mockPart);

            const result = await partService.create(partData);

            expect(result).toEqual(mockPart);
            expect(mockRepository.create).toHaveBeenCalledWith(partData);
            expect(mockRepository.save).toHaveBeenCalledWith(mockPart);
        });

        it("should throw InvalidForeignKeyError when save fails with foreign key error", async () => {
            const queryError = new QueryFailedError("query", undefined, new Error("FOREIGN KEY"));
            mockRepository.create.mockReturnValue({ ...partData, id: "1", createdAt: mockCreatedAt, updatedAt: mockUpdatedAt });
            mockRepository.save.mockRejectedValue(queryError);

            await expect(partService.create(partData))
                .rejects
                .toThrow(InvalidForeignKeyError);
        });

        it("should throw InvalidDataError when save fails with part type check error", async () => {
            const queryError = new QueryFailedError("query", undefined, new Error("part_type_check"));
            mockRepository.create.mockReturnValue({ ...partData, id: "1", createdAt: mockCreatedAt, updatedAt: mockUpdatedAt });
            mockRepository.save.mockRejectedValue(queryError);

            await expect(partService.create(partData))
                .rejects
                .toThrow(InvalidDataError);
        });

        it("should throw InvalidDataError when save fails with other QueryFailedError", async () => {
            mockRepository.create.mockReturnValue({ ...partData, id: "1", createdAt: mockCreatedAt, updatedAt: mockUpdatedAt });
            mockRepository.save.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(partService.create(partData))
                .rejects
                .toThrow(InvalidDataError);
        });
    });

    describe("update", () => {
        const partId = "1";
        const updateData = { name: "Updated Part" };
        const mockCreatedAt = new Date();
        const mockUpdatedAt = new Date();

        it("should update and return the part", async () => {
            const existingPart = {
                id: partId,
                name: "Old Name",
                type: PartType.MECHANICAL,
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                installationDate: new Date(),
                equipmentId: "equipment1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            const updatedPart = { ...existingPart, ...updateData };
            mockRepository.findOne.mockResolvedValue(existingPart);
            mockRepository.save.mockResolvedValue(updatedPart);

            const result = await partService.update(partId, updateData);

            expect(result).toEqual(updatedPart);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedPart);
        });

        it("should throw PartNotFoundError when part doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(partService.update(partId, updateData))
                .rejects
                .toThrow(PartNotFoundError);
        });

        it("should throw InvalidForeignKeyError when save fails with foreign key error", async () => {
            const existingPart = {
                id: partId,
                name: "Old Name",
                type: PartType.MECHANICAL,
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                installationDate: new Date(),
                equipmentId: "equipment1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.findOne.mockResolvedValue(existingPart);
            const queryError = new QueryFailedError("query", undefined, new Error("FOREIGN KEY"));
            mockRepository.save.mockRejectedValue(queryError);

            await expect(partService.update(partId, updateData))
                .rejects
                .toThrow(InvalidForeignKeyError);
        });

        it("should throw InvalidDataError when save fails with part type check error", async () => {
            const existingPart = {
                id: partId,
                name: "Old Name",
                type: PartType.MECHANICAL,
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                installationDate: new Date(),
                equipmentId: "equipment1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.findOne.mockResolvedValue(existingPart);
            const queryError = new QueryFailedError("query", undefined, new Error("part_type_check"));
            mockRepository.save.mockRejectedValue(queryError);

            await expect(partService.update(partId, updateData))
                .rejects
                .toThrow(InvalidDataError);
        });

        it("should throw InvalidDataError when save fails with other QueryFailedError", async () => {
            const existingPart = {
                id: partId,
                name: "Old Name",
                type: PartType.MECHANICAL,
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                installationDate: new Date(),
                equipmentId: "equipment1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.findOne.mockResolvedValue(existingPart);
            mockRepository.save.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(partService.update(partId, updateData))
                .rejects
                .toThrow(InvalidDataError);
        });
    });

    describe("delete", () => {
        const partId = "1";

        it("should delete the part successfully", async () => {
            const mockPart = {
                id: partId,
                name: "Part to Delete",
                type: PartType.MECHANICAL,
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                installationDate: new Date(),
                equipmentId: "equipment1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockPart);
            mockRepository.remove.mockResolvedValue(mockPart);

            await partService.delete(partId);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockPart);
        });

        it("should throw PartNotFoundError when part doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(partService.delete(partId))
                .rejects
                .toThrow(PartNotFoundError);
        });

        it("should throw DependencyExistsError when delete fails with QueryFailedError", async () => {
            const mockPart = {
                id: partId,
                name: "Part with Dependencies",
                type: PartType.MECHANICAL,
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                installationDate: new Date(),
                equipmentId: "equipment1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockPart);
            mockRepository.remove.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(partService.delete(partId))
                .rejects
                .toThrow(DependencyExistsError);
        });
    });
}); 