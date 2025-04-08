import request from 'supertest';
import { app } from '../../src/app';
import { Part, PartType } from '../../src/models/Part';
import { Equipment } from '../../src/models/Equipment';
import { Area } from '../../src/models/Area';
import { Plant } from '../../src/models/Plant';
import { DatabaseContext } from '../../src/config/database-context';
import { Repository } from 'typeorm';
import { beforeEach, describe, it, expect } from '@jest/globals';


describe('Part Controller Integration Tests', () => {
  let partRepository: Repository<Part>;
  let equipmentRepository: Repository<Equipment>;
  let areaRepository: Repository<Area>;
  let plantRepository: Repository<Plant>;
  let testEquipment: Equipment;
  let testArea: Area;
  let testPlant: Plant;

  beforeEach(async () => {
    partRepository = DatabaseContext.getInstance().getRepository(Part);
    equipmentRepository = DatabaseContext.getInstance().getRepository(Equipment);
    areaRepository = DatabaseContext.getInstance().getRepository(Area);
    plantRepository = DatabaseContext.getInstance().getRepository(Plant);
    
    // Clear the tables before each test
    await partRepository.clear();
    await equipmentRepository.clear();
    await areaRepository.clear();
    await plantRepository.clear();

    // Create test plant, area, and equipment for part associations
    testPlant = await plantRepository.save(
      plantRepository.create({
        name: 'Test Plant',
        address: 'Test Address'
      })
    );

    testArea = await areaRepository.save(
      areaRepository.create({
        name: 'Test Area',
        locationDescription: 'Test Location',
        plantId: testPlant.id
      })
    );

    testEquipment = await equipmentRepository.save(
      equipmentRepository.create({
        name: 'Test Equipment',
        manufacturer: 'Test Manufacturer',
        serialNumber: 'TST001',
        initialOperationsDate: new Date('2024-01-01'),
        areaId: testArea.id
      })
    );
  });

  describe('GET /parts', () => {
    it('should return all parts', async () => {
      const installDate = new Date('2024-01-01');
      // Create test parts
      const testParts = [
        partRepository.create({
          name: 'Test Part 1',
          type: PartType.MECHANICAL,
          manufacturer: 'Manufacturer 1',
          serialNumber: 'SN001',
          installationDate: installDate,
          equipmentId: testEquipment.id
        }),
        partRepository.create({
          name: 'Test Part 2',
          type: PartType.ELECTRONIC,
          manufacturer: 'Manufacturer 2',
          serialNumber: 'SN002',
          installationDate: installDate,
          equipmentId: testEquipment.id
        })
      ];
      await partRepository.save(testParts);

      const response = await request(app)
        .get('/parts')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Part 1',
            type: PartType.MECHANICAL,
            manufacturer: 'Manufacturer 1',
            serialNumber: 'SN001',
            equipmentId: testEquipment.id
          }),
          expect.objectContaining({
            name: 'Test Part 2',
            type: PartType.ELECTRONIC,
            manufacturer: 'Manufacturer 2',
            serialNumber: 'SN002',
            equipmentId: testEquipment.id
          })
        ])
      );
    });

    it('should return an empty array when no parts exist', async () => {
      const response = await request(app)
        .get('/parts')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /parts/:id', () => {
    it('should return a specific part by ID', async () => {
      const installDate = new Date('2024-01-01');
      const part = await partRepository.save(
        partRepository.create({
          name: 'Test Part',
          type: PartType.MECHANICAL,
          manufacturer: 'Test Manufacturer',
          serialNumber: 'TST001',
          installationDate: installDate,
          equipmentId: testEquipment.id
        })
      );

      const response = await request(app)
        .get(`/parts/${part.id}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: part.id,
          name: 'Test Part',
          type: PartType.MECHANICAL,
          manufacturer: 'Test Manufacturer',
          serialNumber: 'TST001',
          equipmentId: testEquipment.id
        })
      );
    });

    it('should return 404 when part ID does not exist', async () => {
      await request(app)
        .get('/parts/nonexistent-id')
        .expect(404);
    });
  });

  describe('POST /parts', () => {
    it('should create new part with valid data', async () => {
      const installDate = new Date('2024-01-01');
      const newPart = {
        name: 'New Part',
        type: PartType.HYDRAULICAL,
        manufacturer: 'New Manufacturer',
        serialNumber: 'NEW001',
        installationDate: installDate.toISOString(),
        equipmentId: testEquipment.id
      };

      const response = await request(app)
        .post('/parts')
        .send(newPart)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          name: newPart.name,
          type: newPart.type,
          manufacturer: newPart.manufacturer,
          serialNumber: newPart.serialNumber,
          equipmentId: newPart.equipmentId
        })
      );

      // Verify part was created in database
      const savedPart = await partRepository.findOne({ where: { id: response.body.id } });
      expect(savedPart).toBeTruthy();
      expect(savedPart?.name).toBe(newPart.name);
      expect(savedPart?.type).toBe(newPart.type);
    });

    it('should reject part creation with missing required fields', async () => {
      const invalidPart = {
        manufacturer: 'Missing Name',
        equipmentId: testEquipment.id
      };

      await request(app)
        .post('/parts')
        .send(invalidPart)
        .expect(400);
    });

    it('should reject part creation with invalid part type', async () => {
      const installDate = new Date('2024-01-01');
      const invalidPart = {
        name: 'Test Part',
        type: 'INVALID_TYPE',
        manufacturer: 'Test Manufacturer',
        serialNumber: 'TST001',
        installationDate: installDate.toISOString(),
        equipmentId: testEquipment.id
      };

      await request(app)
        .post('/parts')
        .send(invalidPart)
        .expect(400);
    });

    it('should reject part creation with non-existent equipment ID', async () => {
      const installDate = new Date('2024-01-01');
      const invalidPart = {
        name: 'Test Part',
        type: PartType.MECHANICAL,
        manufacturer: 'Test Manufacturer',
        serialNumber: 'TST001',
        installationDate: installDate.toISOString(),
        equipmentId: 'nonexistent-id'
      };

      await request(app)
        .post('/parts')
        .send(invalidPart)
        .expect(400);
    });
  });

  describe('PUT /parts/:id', () => {
    it('should update existing part', async () => {
      const installDate = new Date('2024-01-01');
      const part = await partRepository.save(
        partRepository.create({
          name: 'Original Name',
          type: PartType.MECHANICAL,
          manufacturer: 'Original Manufacturer',
          serialNumber: 'ORG001',
          installationDate: installDate,
          equipmentId: testEquipment.id
        })
      );

      const updateData = {
        name: 'Updated Name',
        type: PartType.ELECTRONIC,
        manufacturer: 'Updated Manufacturer'
      };

      const response = await request(app)
        .put(`/parts/${part.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: part.id,
          name: updateData.name,
          type: updateData.type,
          manufacturer: updateData.manufacturer,
          equipmentId: testEquipment.id
        })
      );

      // Verify update in database
      const updatedPart = await partRepository.findOne({ where: { id: part.id } });
      expect(updatedPart?.name).toBe(updateData.name);
      expect(updatedPart?.type).toBe(updateData.type);
    });

    it('should return 404 when updating non-existent part', async () => {
      await request(app)
        .put('/parts/nonexistent-id')
        .send({ name: 'New Name' })
        .expect(404);
    });

    it('should handle partial updates', async () => {
      const installDate = new Date('2024-01-01');
      const part = await partRepository.save(
        partRepository.create({
          name: 'Original Name',
          type: PartType.MECHANICAL,
          manufacturer: 'Original Manufacturer',
          serialNumber: 'ORG001',
          installationDate: installDate,
          equipmentId: testEquipment.id
        })
      );

      const response = await request(app)
        .put(`/parts/${part.id}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          name: 'Updated Name',
          type: PartType.MECHANICAL,
          manufacturer: 'Original Manufacturer'
        })
      );
    });
  });

  describe('DELETE /parts/:id', () => {
    it('should delete existing part', async () => {
      const installDate = new Date('2024-01-01');
      const part = await partRepository.save(
        partRepository.create({
          name: 'To Delete',
          type: PartType.MECHANICAL,
          manufacturer: 'Delete Manufacturer',
          serialNumber: 'DEL001',
          installationDate: installDate,
          equipmentId: testEquipment.id
        })
      );

      await request(app)
        .delete(`/parts/${part.id}`)
        .expect(204);

      // Verify part was deleted
      const deletedPart = await partRepository.findOne({ where: { id: part.id } });
      expect(deletedPart).toBeNull();
    });

    it('should return 404 when deleting non-existent part', async () => {
      await request(app)
        .delete('/parts/nonexistent-id')
        .expect(404);
    });
  });
}); 