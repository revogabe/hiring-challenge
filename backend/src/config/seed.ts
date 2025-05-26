import { DataSource } from "typeorm";
import { Plant } from "../models/Plant";
import { Area } from "../models/Area";
import { Equipment } from "../models/Equipment";
import { Part, PartType } from "../models/Part";

export async function seedDatabase(dataSource: DataSource) {
  const plantCount = await dataSource.getRepository(Plant).count();
  if (plantCount > 0) {
    console.log("Database already seeded. Skipping...");
    return;
  }

  console.log("Seeding database with demo data...");

  const plants = await dataSource.getRepository(Plant).save([
    {
      name: "Data Center São Paulo",
      address: "Av. Paulista, 1000 - São Paulo, SP",
    },
    {
      name: "Refinaria Rio de Janeiro",
      address: "Av. Brasil, 500 - Rio de Janeiro, RJ",
    },
    {
      name: "Complexo Agrícola Goiás",
      address: "Rodovia GO-020, Km 50 - Goiânia, GO",
    },
    {
      name: "Data Center Fortaleza",
      address: "Av. Washington Soares, 200 - Fortaleza, CE",
    },
    {
      name: "Refinaria Paulínia",
      address: "Rod. SP-332, Km 132 - Paulínia, SP",
    },
  ]);

  // Create Areas for each plant
  const areaRepository = dataSource.getRepository(Area);
  const areas: Area[] = [];

  // Data Center São Paulo Areas
  const dataCenterSPAreas = [
    {
      name: "Sala de Servidores Principal",
      locationDescription: "Piso 1 - Ala Norte",
      plant: plants[0],
      plantId: plants[0].id,
    },
    {
      name: "Área de Refrigeração",
      locationDescription: "Piso 1 - Ala Sul",
      plant: plants[0],
      plantId: plants[0].id,
    },
    {
      name: "Sala de UPS",
      locationDescription: "Subsolo - Ala Leste",
      plant: plants[0],
      plantId: plants[0].id,
    },
    {
      name: "Área de Telecomunicações",
      locationDescription: "Piso 2 - Ala Central",
      plant: plants[0],
      plantId: plants[0].id,
    },
    {
      name: "Sala de Monitoramento",
      locationDescription: "Piso 2 - Ala Oeste",
      plant: plants[0],
      plantId: plants[0].id,
    },
  ].map((area) => areaRepository.create(area));

  areas.push(...dataCenterSPAreas);

  // Refinaria Rio de Janeiro Areas
  const refineryRJAreas = [
    {
      name: "Unidade de Destilação",
      locationDescription: "Setor A - Área Industrial",
      plant: plants[1],
      plantId: plants[1].id,
    },
    {
      name: "Área de Caldeiras",
      locationDescription: "Setor B - Área Industrial",
      plant: plants[1],
      plantId: plants[1].id,
    },
    {
      name: "Unidade de Compressores",
      locationDescription: "Setor C - Área Industrial",
      plant: plants[1],
      plantId: plants[1].id,
    },
    {
      name: "Estação de Bombeamento",
      locationDescription: "Setor D - Área Industrial",
      plant: plants[1],
      plantId: plants[1].id,
    },
    {
      name: "Central de Controle",
      locationDescription: "Prédio Administrativo - Piso 1",
      plant: plants[1],
      plantId: plants[1].id,
    },
  ].map((area) => areaRepository.create(area));

  areas.push(...refineryRJAreas);

  // Complexo Agrícola Goiás Areas
  const agricultureGOAreas = [
    {
      name: "Armazém de Grãos",
      locationDescription: "Setor 1 - Área de Armazenamento",
      plant: plants[2],
      plantId: plants[2].id,
    },
    {
      name: "Área de Manutenção",
      locationDescription: "Setor 2 - Oficina",
      plant: plants[2],
      plantId: plants[2].id,
    },
    {
      name: "Centro de Distribuição",
      locationDescription: "Setor 3 - Logística",
      plant: plants[2],
      plantId: plants[2].id,
    },
    {
      name: "Área de Processamento",
      locationDescription: "Setor 4 - Beneficiamento",
      plant: plants[2],
      plantId: plants[2].id,
    },
    {
      name: "Pátio de Máquinas",
      locationDescription: "Setor 5 - Área Externa",
      plant: plants[2],
      plantId: plants[2].id,
    },
  ].map((area) => areaRepository.create(area));

  areas.push(...agricultureGOAreas);

  // Data Center Fortaleza Areas
  const dataCenterFEAreas = [
    {
      name: "Sala de Servidores A",
      locationDescription: "Piso 1 - Bloco A",
      plant: plants[3],
      plantId: plants[3].id,
    },
    {
      name: "Sala de Energia",
      locationDescription: "Térreo - Bloco B",
      plant: plants[3],
      plantId: plants[3].id,
    },
    {
      name: "NOC",
      locationDescription: "Piso 2 - Bloco A",
      plant: plants[3],
      plantId: plants[3].id,
    },
    {
      name: "Área de Backup",
      locationDescription: "Piso 1 - Bloco B",
      plant: plants[3],
      plantId: plants[3].id,
    },
    {
      name: "Sala de Conectividade",
      locationDescription: "Piso 2 - Bloco B",
      plant: plants[3],
      plantId: plants[3].id,
    },
  ].map((area) => areaRepository.create(area));

  areas.push(...dataCenterFEAreas);

  // Refinaria Paulínia Areas
  const refineryPAAreas = [
    {
      name: "Unidade de Craqueamento",
      locationDescription: "Área Industrial - Setor 1",
      plant: plants[4],
      plantId: plants[4].id,
    },
    {
      name: "Área de Tancagem",
      locationDescription: "Área Industrial - Setor 2",
      plant: plants[4],
      plantId: plants[4].id,
    },
    {
      name: "Central de Utilidades",
      locationDescription: "Área Industrial - Setor 3",
      plant: plants[4],
      plantId: plants[4].id,
    },
    {
      name: "Unidade de Tratamento",
      locationDescription: "Área Industrial - Setor 4",
      plant: plants[4],
      plantId: plants[4].id,
    },
    {
      name: "Laboratório de Controle",
      locationDescription: "Prédio Técnico - Piso 1",
      plant: plants[4],
      plantId: plants[4].id,
    },
  ].map((area) => areaRepository.create(area));

  areas.push(...refineryPAAreas);

  console.log("Setting up neighbor relationships...");

  // Define neighbor relationships for Data Center São Paulo
  dataCenterSPAreas[0].neighbors = [dataCenterSPAreas[1], dataCenterSPAreas[2]]; // Servidores -> Refrigeração, UPS
  dataCenterSPAreas[1].neighbors = [dataCenterSPAreas[0], dataCenterSPAreas[4]]; // Refrigeração -> Servidores, Monitoramento
  dataCenterSPAreas[2].neighbors = [dataCenterSPAreas[0], dataCenterSPAreas[3]]; // UPS -> Servidores, Telecomunicações
  dataCenterSPAreas[3].neighbors = [dataCenterSPAreas[2], dataCenterSPAreas[4]]; // Telecomunicações -> UPS, Monitoramento
  dataCenterSPAreas[4].neighbors = [dataCenterSPAreas[1], dataCenterSPAreas[3]]; // Monitoramento -> Refrigeração, Telecomunicações

  // Define neighbor relationships for Refinaria Rio de Janeiro
  refineryRJAreas[0].neighbors = [refineryRJAreas[1], refineryRJAreas[2]]; // Destilação -> Caldeiras, Compressores
  refineryRJAreas[1].neighbors = [refineryRJAreas[0], refineryRJAreas[3]]; // Caldeiras -> Destilação, Bombeamento
  refineryRJAreas[2].neighbors = [
    refineryRJAreas[0],
    refineryRJAreas[3],
    refineryRJAreas[4],
  ]; // Compressores -> Destilação, Bombeamento, Controle
  refineryRJAreas[3].neighbors = [refineryRJAreas[1], refineryRJAreas[2]]; // Bombeamento -> Caldeiras, Compressores
  refineryRJAreas[4].neighbors = [refineryRJAreas[2]]; // Controle -> Compressores

  // Define neighbor relationships for Complexo Agrícola Goiás
  agricultureGOAreas[0].neighbors = [
    agricultureGOAreas[2],
    agricultureGOAreas[3],
  ]; // Armazém -> Distribuição, Processamento
  agricultureGOAreas[1].neighbors = [agricultureGOAreas[4]]; // Manutenção -> Pátio
  agricultureGOAreas[2].neighbors = [
    agricultureGOAreas[0],
    agricultureGOAreas[3],
  ]; // Distribuição -> Armazém, Processamento
  agricultureGOAreas[3].neighbors = [
    agricultureGOAreas[0],
    agricultureGOAreas[2],
  ]; // Processamento -> Armazém, Distribuição
  agricultureGOAreas[4].neighbors = [agricultureGOAreas[1]]; // Pátio -> Manutenção

  // Define neighbor relationships for Data Center Fortaleza
  dataCenterFEAreas[0].neighbors = [dataCenterFEAreas[1], dataCenterFEAreas[3]]; // Servidores A -> Energia, Backup
  dataCenterFEAreas[1].neighbors = [dataCenterFEAreas[0], dataCenterFEAreas[3]]; // Energia -> Servidores A, Backup
  dataCenterFEAreas[2].neighbors = [dataCenterFEAreas[4]]; // NOC -> Conectividade
  dataCenterFEAreas[3].neighbors = [dataCenterFEAreas[0], dataCenterFEAreas[1]]; // Backup -> Servidores A, Energia
  dataCenterFEAreas[4].neighbors = [dataCenterFEAreas[2]]; // Conectividade -> NOC

  // Define neighbor relationships for Refinaria Paulínia
  refineryPAAreas[0].neighbors = [refineryPAAreas[1], refineryPAAreas[2]]; // Craqueamento -> Tancagem, Utilidades
  refineryPAAreas[1].neighbors = [refineryPAAreas[0], refineryPAAreas[3]]; // Tancagem -> Craqueamento, Tratamento
  refineryPAAreas[2].neighbors = [
    refineryPAAreas[0],
    refineryPAAreas[3],
    refineryPAAreas[4],
  ]; // Utilidades -> Craqueamento, Tratamento, Laboratório
  refineryPAAreas[3].neighbors = [refineryPAAreas[1], refineryPAAreas[2]]; // Tratamento -> Tancagem, Utilidades
  refineryPAAreas[4].neighbors = [refineryPAAreas[2]]; // Laboratório -> Utilidades

  // Save areas with neighbor relationships
  await areaRepository.save(areas);

  // Create Equipment
  const equipmentRepository = dataSource.getRepository(Equipment);
  const partRepository = dataSource.getRepository(Part);

  // Array to store all equipment
  const allEquipment: Equipment[] = [];

  // Create equipment for Data Center São Paulo
  const dataCenterSPEquipment = [
    {
      name: "Rack de Servidores Dell R740",
      manufacturer: "Dell",
      serialNumber: `DELL-SP-001`,
      initialOperationsDate: new Date("2023-01-15"),
    },
    {
      name: "Switch Cisco Nexus 9300",
      manufacturer: "Cisco",
      serialNumber: `CISCO-SP-001`,
      initialOperationsDate: new Date("2023-02-10"),
    },
    {
      name: "UPS Symmetra PX 100kW",
      manufacturer: "APC",
      serialNumber: `APC-SP-001`,
      initialOperationsDate: new Date("2023-01-20"),
    },
    {
      name: "Sistema de Refrigeração",
      manufacturer: "Carrier",
      serialNumber: `COOLING-SP-001`,
      initialOperationsDate: new Date("2023-01-05"),
    },
    {
      name: "Sistema de Monitoramento Ambiental",
      manufacturer: "Schneider Electric",
      serialNumber: `ENV-SP-001`,
      initialOperationsDate: new Date("2023-03-01"),
    },
  ].map((eq) => equipmentRepository.create(eq));

  // Assign equipment to areas (now many-to-many)
  // Rack presente em Sala de Servidores e na Área de Telecomunicações (vizinhos através da UPS)
  dataCenterSPEquipment[0].areas = [dataCenterSPAreas[0], dataCenterSPAreas[3]];

  // Switch presente em Sala de Servidores e Sala de Monitoramento
  dataCenterSPEquipment[1].areas = [dataCenterSPAreas[0], dataCenterSPAreas[4]];

  // UPS presente na Sala de UPS mas serve as áreas adjacentes
  dataCenterSPEquipment[2].areas = [dataCenterSPAreas[2]];

  // Sistema de Refrigeração presente na Área de Refrigeração mas também serve a Sala de Servidores
  dataCenterSPEquipment[3].areas = [dataCenterSPAreas[1], dataCenterSPAreas[0]];

  // Sistema de Monitoramento presente na Sala de Monitoramento e Área de Telecomunicações
  dataCenterSPEquipment[4].areas = [dataCenterSPAreas[4], dataCenterSPAreas[3]];

  allEquipment.push(...dataCenterSPEquipment);

  // Refinaria Rio de Janeiro equipment
  const refineryRJEquipment = [
    {
      name: "Caldeira Industrial B-2500",
      manufacturer: "Mitsubishi Heavy Industries",
      serialNumber: `CALB-RJ-001`,
      initialOperationsDate: new Date("2023-05-20"),
    },
    {
      name: "Compressor de Gás C-3000",
      manufacturer: "Atlas Copco",
      serialNumber: `COMP-RJ-001`,
      initialOperationsDate: new Date("2023-06-15"),
    },
    {
      name: "Bomba Centrífuga P-1500",
      manufacturer: "Grundfos",
      serialNumber: `BOMB-RJ-001`,
      initialOperationsDate: new Date("2023-05-25"),
    },
    {
      name: "Sistema de Controle Distribuído",
      manufacturer: "Honeywell",
      serialNumber: `DCS-RJ-001`,
      initialOperationsDate: new Date("2023-07-10"),
    },
  ].map((eq) => equipmentRepository.create(eq));

  // Assign equipment to areas
  // Caldeira presente em Área de Caldeiras e Unidade de Destilação
  refineryRJEquipment[0].areas = [refineryRJAreas[1], refineryRJAreas[0]];

  // Compressor presente em Unidade de Compressores e conectado à Unidade de Destilação
  refineryRJEquipment[1].areas = [refineryRJAreas[2], refineryRJAreas[0]];

  // Bomba presente em Estação de Bombeamento e também conectada à Área de Caldeiras
  refineryRJEquipment[2].areas = [refineryRJAreas[3], refineryRJAreas[1]];

  // Sistema de Controle Distribuído serve a Central de Controle e Unidade de Compressores
  refineryRJEquipment[3].areas = [refineryRJAreas[4], refineryRJAreas[2]];

  allEquipment.push(...refineryRJEquipment);

  // Complexo Agrícola Goiás
  const agricultureGOEquipment = [
    {
      name: "Trator John Deere 6M",
      manufacturer: "John Deere",
      serialNumber: `JD-GO-001`,
      initialOperationsDate: new Date("2023-03-10"),
    },
    {
      name: "Colheitadeira New Holland TC5090",
      manufacturer: "New Holland",
      serialNumber: `NH-GO-001`,
      initialOperationsDate: new Date("2023-04-05"),
    },
    {
      name: "Sistema de Irrigação Valley",
      manufacturer: "Valley Irrigation",
      serialNumber: `VAL-GO-001`,
      initialOperationsDate: new Date("2023-02-20"),
    },
  ].map((eq) => equipmentRepository.create(eq));

  // Máquinas agrícolas estão principalmente no pátio com acesso à manutenção
  agricultureGOEquipment[0].areas = [
    agricultureGOAreas[4],
    agricultureGOAreas[1],
  ];
  agricultureGOEquipment[1].areas = [
    agricultureGOAreas[4],
    agricultureGOAreas[1],
  ];

  // Sistema de irrigação serve às áreas de processamento e distribuição
  agricultureGOEquipment[2].areas = [
    agricultureGOAreas[3],
    agricultureGOAreas[2],
  ];

  allEquipment.push(...agricultureGOEquipment);

  // Data Center Fortaleza equipment
  const dataCenterFEEquipment = [
    {
      name: "Servidor IBM Power Systems",
      manufacturer: "IBM",
      serialNumber: `IBM-FE-001`,
      initialOperationsDate: new Date("2023-09-15"),
    },
    {
      name: "Storage NetApp FAS8300",
      manufacturer: "NetApp",
      serialNumber: `NTAP-FE-001`,
      initialOperationsDate: new Date("2023-09-20"),
    },
  ].map((eq) => equipmentRepository.create(eq));

  // Equipamentos de data center distribuídos pelas áreas conectadas
  dataCenterFEEquipment[0].areas = [dataCenterFEAreas[0], dataCenterFEAreas[3]]; // Servidores A e Backup
  dataCenterFEEquipment[1].areas = [dataCenterFEAreas[3], dataCenterFEAreas[1]]; // Backup e Energia

  allEquipment.push(...dataCenterFEEquipment);

  // Refinaria Paulínia equipment
  const refineryPAEquipment = [
    {
      name: "Unidade de Craqueamento Catalítico",
      manufacturer: "UOP Honeywell",
      serialNumber: `CRACK-PA-001`,
      initialOperationsDate: new Date("2023-08-01"),
    },
    {
      name: "Sistema de Tratamento de Efluentes",
      manufacturer: "Veolia",
      serialNumber: `TREAT-PA-001`,
      initialOperationsDate: new Date("2023-08-15"),
    },
  ].map((eq) => equipmentRepository.create(eq));

  // Equipamentos distribuídos em áreas conectadas
  refineryPAEquipment[0].areas = [refineryPAAreas[0], refineryPAAreas[2]]; // Craqueamento e Utilidades
  refineryPAEquipment[1].areas = [refineryPAAreas[3], refineryPAAreas[2]]; // Tratamento e Utilidades

  allEquipment.push(...refineryPAEquipment);

  // Save all equipment with their area relationships
  const savedEquipment = await equipmentRepository.save(allEquipment);

  // Create Parts for each equipment
  console.log("Creating parts for equipment...");

  for (const equipment of savedEquipment) {
    const partsList = [];

    // Data Center Parts
    if (
      equipment.name.includes("Rack") ||
      equipment.name.includes("Switch") ||
      equipment.name.includes("UPS") ||
      equipment.name.includes("Servidor") ||
      equipment.name.includes("Storage")
    ) {
      partsList.push(
        ...[
          {
            name: "Fonte de Alimentação",
            type: PartType.ELECTRIC,
            manufacturer: "Dell EMC",
            serialNumber: `PWR-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-01-15"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Placa de Controle",
            type: PartType.ELECTRONIC,
            manufacturer: "Intel",
            serialNumber: `CTRL-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-01-15"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Sistema de Ventilação",
            type: PartType.MECHANICAL,
            manufacturer: "CoolMaster",
            serialNumber: `FAN-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-01-15"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Módulo de Monitoramento",
            type: PartType.ELECTRONIC,
            manufacturer: "Cisco",
            serialNumber: `MON-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-01-15"),
            equipment,
            equipmentId: equipment.id,
          },
        ].map((part) => partRepository.create(part))
      );
    }
    // Refinery Parts
    else if (
      equipment.name.includes("Caldeira") ||
      equipment.name.includes("Compressor") ||
      equipment.name.includes("Bomba") ||
      equipment.name.includes("Craqueamento") ||
      equipment.name.includes("Tratamento")
    ) {
      partsList.push(
        ...[
          {
            name: "Motor Principal",
            type: PartType.MECHANICAL,
            manufacturer: "Siemens",
            serialNumber: `MOT-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-02-01"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Sistema Hidráulico",
            type: PartType.HYDRAULICAL,
            manufacturer: "Bosch Rexroth",
            serialNumber: `HYD-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-02-01"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Painel de Controle",
            type: PartType.ELECTRONIC,
            manufacturer: "ABB",
            serialNumber: `PNL-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-02-01"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Sistema de Monitoramento",
            type: PartType.ELECTRONIC,
            manufacturer: "Emerson",
            serialNumber: `MON-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-02-01"),
            equipment,
            equipmentId: equipment.id,
          },
        ].map((part) => partRepository.create(part))
      );
    }
    // Agricultural Parts
    else {
      partsList.push(
        ...[
          {
            name: "Motor Diesel",
            type: PartType.MECHANICAL,
            manufacturer: "Cummins",
            serialNumber: `ENG-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-01-10"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Sistema Hidráulico",
            type: PartType.HYDRAULICAL,
            manufacturer: "Parker",
            serialNumber: `HYD-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-01-10"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Sistema Elétrico",
            type: PartType.ELECTRIC,
            manufacturer: "Bosch",
            serialNumber: `ELE-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-01-10"),
            equipment,
            equipmentId: equipment.id,
          },
          {
            name: "Computador de Bordo",
            type: PartType.ELECTRONIC,
            manufacturer: "Trimble",
            serialNumber: `CPU-${equipment.id.substring(0, 6)}`,
            installationDate: new Date("2024-01-10"),
            equipment,
            equipmentId: equipment.id,
          },
        ].map((part) => partRepository.create(part))
      );
    }

    await partRepository.save(partsList);
  }

  console.log("Database seeded successfully!");
}
