import { EquipmentService } from "../../src/services/EquipmentService";
import { DatabaseContext } from "../../src/config/database-context";
import { Equipment } from "../../src/models/Equipment";
import { Repository, QueryFailedError } from "typeorm";
import { EquipmentNotFoundError } from "../../src/errors/EquipmentNotFoundError";
import { InvalidForeignKeyError } from "../../src/errors/InvalidForeignKeyError";
import { InvalidDataError } from "../../src/errors/InvalidDataError";
import { DependencyExistsError } from "../../src/errors/DependencyExistsError";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("../../src/config/database-context");

describe("EquipmentService", () => {
    let equipmentService: EquipmentService;
    let mockRepository: jest.Mocked<Repository<Equipment>>;

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

        equipmentService = new EquipmentService();
    });

    describe("findAll", () => {
        it("should return all equipment with their relations", async () => {
            const mockEquipment = [{
                id: "1",
                name: "Equipment 1",
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                initialOperationsDate: new Date(),
                areaId: "area1",
                createdAt: new Date(),
                updatedAt: new Date()
            }];
            mockRepository.find.mockResolvedValue(mockEquipment);

            const result = await equipmentService.findAll();

            expect(result).toEqual(mockEquipment);
            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ["area", "parts"]
            });
        });
    });

    describe("findById", () => {
        it("should return equipment when found", async () => {
            const mockEquipment = {
                id: "1",
                name: "Equipment 1",
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                initialOperationsDate: new Date(),
                areaId: "area1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockEquipment);

            const result = await equipmentService.findById("1");

            expect(result).toEqual(mockEquipment);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: "1" },
                relations: ["area", "parts"]
            });
        });

        it("should throw EquipmentNotFoundError when equipment doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(equipmentService.findById("1"))
                .rejects
                .toThrow(EquipmentNotFoundError);
        });
    });

    describe("create", () => {
        const mockCreatedAt = new Date();
        const mockUpdatedAt = new Date();
        const equipmentData = {
            name: "New Equipment",
            manufacturer: "Test Manufacturer",
            serialNumber: "123456",
            initialOperationsDate: new Date(),
            areaId: "area1"
        };

        it("should create and return new equipment", async () => {
            const mockEquipment = {
                ...equipmentData,
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.create.mockReturnValue(mockEquipment);
            mockRepository.save.mockResolvedValue(mockEquipment);
            mockRepository.findOne.mockResolvedValue(mockEquipment);

            const result = await equipmentService.create(equipmentData);

            expect(result).toEqual(mockEquipment);
            expect(mockRepository.create).toHaveBeenCalledWith(equipmentData);
            expect(mockRepository.save).toHaveBeenCalledWith(mockEquipment);
        });

        it("should throw InvalidForeignKeyError when save fails with foreign key error", async () => {
            const mockEquipment = {
                ...equipmentData,
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            const queryError = new QueryFailedError("query", undefined, new Error("FOREIGN KEY"));
            mockRepository.create.mockReturnValue(mockEquipment);
            mockRepository.save.mockRejectedValue(queryError);

            await expect(equipmentService.create(equipmentData))
                .rejects
                .toThrow(InvalidForeignKeyError);
        });

        it("should throw InvalidDataError when save fails with other QueryFailedError", async () => {
            const mockEquipment = {
                ...equipmentData,
                id: "1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.create.mockReturnValue(mockEquipment);
            mockRepository.save.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(equipmentService.create(equipmentData))
                .rejects
                .toThrow(InvalidDataError);
        });
    });

    describe("update", () => {
        const equipmentId = "1";
        const updateData = { name: "Updated Equipment" };
        const mockCreatedAt = new Date();
        const mockUpdatedAt = new Date();

        it("should update and return the equipment", async () => {
            const existingEquipment = {
                id: equipmentId,
                name: "Old Name",
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                initialOperationsDate: new Date(),
                areaId: "area1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            const updatedEquipment = { ...existingEquipment, ...updateData };
            mockRepository.findOne.mockResolvedValue(existingEquipment);
            mockRepository.save.mockResolvedValue(updatedEquipment);

            const result = await equipmentService.update(equipmentId, updateData);

            expect(result).toEqual(updatedEquipment);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedEquipment);
        });

        it("should throw EquipmentNotFoundError when equipment doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(equipmentService.update(equipmentId, updateData))
                .rejects
                .toThrow(EquipmentNotFoundError);
        });

        it("should throw InvalidForeignKeyError when save fails with foreign key error", async () => {
            const existingEquipment = {
                id: equipmentId,
                name: "Old Name",
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                initialOperationsDate: new Date(),
                areaId: "area1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.findOne.mockResolvedValue(existingEquipment);
            const queryError = new QueryFailedError("query", undefined, new Error("FOREIGN KEY"));
            mockRepository.save.mockRejectedValue(queryError);

            await expect(equipmentService.update(equipmentId, updateData))
                .rejects
                .toThrow(InvalidForeignKeyError);
        });

        it("should throw InvalidDataError when save fails with other QueryFailedError", async () => {
            const existingEquipment = {
                id: equipmentId,
                name: "Old Name",
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                initialOperationsDate: new Date(),
                areaId: "area1",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt
            };
            mockRepository.findOne.mockResolvedValue(existingEquipment);
            mockRepository.save.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(equipmentService.update(equipmentId, updateData))
                .rejects
                .toThrow(InvalidDataError);
        });
    });

    describe("delete", () => {
        const equipmentId = "1";

        it("should delete the equipment successfully", async () => {
            const mockEquipment = {
                id: equipmentId,
                name: "Equipment to Delete",
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                initialOperationsDate: new Date(),
                areaId: "area1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockEquipment);
            mockRepository.remove.mockResolvedValue(mockEquipment);

            await equipmentService.delete(equipmentId);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockEquipment);
        });

        it("should throw EquipmentNotFoundError when equipment doesn't exist", async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(equipmentService.delete(equipmentId))
                .rejects
                .toThrow(EquipmentNotFoundError);
        });

        it("should throw DependencyExistsError when delete fails with QueryFailedError", async () => {
            const mockEquipment = {
                id: equipmentId,
                name: "Equipment with Dependencies",
                manufacturer: "Test Manufacturer",
                serialNumber: "123456",
                initialOperationsDate: new Date(),
                areaId: "area1",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockRepository.findOne.mockResolvedValue(mockEquipment);
            mockRepository.remove.mockRejectedValue(new QueryFailedError("query", undefined, new Error("error")));

            await expect(equipmentService.delete(equipmentId))
                .rejects
                .toThrow(DependencyExistsError);
        });
    });
}); 