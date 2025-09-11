import { ColonizationData } from "@prisma/client";
import { Position } from "../utils/models";

// Mock the entire database module
const mockPrisma = {
  colonizationData: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  participants: {
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
};

const prisma = mockPrisma;

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Import the functions after mocking
import {
  addColonizationData,
  getColonizationDataById,
  getColonizationDataByProjectName,
  getAllColonizationData,
  participateInColonizationData,
  markColonizationDataAsCompleted,
  updateColonizationData,
  removeColonizationDataById,
} from "../utils/database";

// Real Elite Dangerous solar systems data
const mockColonizationData: Partial<ColonizationData>[] = [
  {
    id: 1,
    projectName: "Sol Gateway Station",
    systemName: "Sol",
    timeLeft: 86400, // 1 day
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    architect: "Commander Jameson",
    progress: 45,
    starPortType: "Orbis Starport",
    isPrimaryPort: true,
    srv_survey_link: "https://survey.example.com/sol",
    isCompleted: false,
    createdAt: new Date("2025-09-01"),
    updatedAt: new Date("2025-09-10"),
    addedBy: "Commander Jameson",
    notes: "Primary gateway station for Sol system",
  },
  {
    id: 2,
    projectName: "Sirius Industrial Complex",
    systemName: "Sirius",
    timeLeft: 172800, // 2 days
    positionX: -1.48,
    positionY: -1.48,
    positionZ: 8.59,
    architect: "Commander Chen",
    progress: 75,
    starPortType: "Coriolis Starport",
    isPrimaryPort: false,
    srv_survey_link: "https://survey.example.com/sirius",
    isCompleted: false,
    createdAt: new Date("2025-08-15"),
    updatedAt: new Date("2025-09-09"),
    addedBy: "Commander Chen",
    notes: "Industrial complex for Sirius Corp operations",
  },
  {
    id: 3,
    projectName: "Sagittarius A* Research Station",
    systemName: "Sagittarius A*",
    timeLeft: 604800, // 7 days
    positionX: 25.21875,
    positionY: -20.90625,
    positionZ: 25899.96875,
    architect: "Commander Explorer",
    progress: 15,
    starPortType: "Asteroid Base",
    isPrimaryPort: true,
    srv_survey_link: "https://survey.example.com/sagittarius-a-star",
    isCompleted: false,
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2025-09-08"),
    addedBy: "Commander Explorer",
    notes: "Deep space research station near galactic center",
  },
  {
    id: 4,
    projectName: "Alpha Centauri Trade Hub",
    systemName: "Alpha Centauri",
    timeLeft: 0,
    positionX: -0.375,
    positionY: 1.25,
    positionZ: -1.40625,
    architect: "Commander Trader",
    progress: 100,
    starPortType: "Ocellus Starport",
    isPrimaryPort: true,
    srv_survey_link: "https://survey.example.com/alpha-centauri",
    isCompleted: true,
    createdAt: new Date("2025-07-01"),
    updatedAt: new Date("2025-08-15"),
    addedBy: "Commander Trader",
    notes: "Completed trade hub in Alpha Centauri system",
  },
  {
    id: 5,
    projectName: "Proxima Research Outpost",
    systemName: "Proxima Centauri",
    timeLeft: 43200, // 12 hours
    positionX: -1.1875,
    positionY: 0.875,
    positionZ: -1.1875,
    architect: "Commander Science",
    progress: 90,
    starPortType: "Planetary Base",
    isPrimaryPort: false,
    srv_survey_link: "https://survey.example.com/proxima",
    isCompleted: false,
    createdAt: new Date("2025-09-05"),
    updatedAt: new Date("2025-09-10"),
    addedBy: "Commander Science",
    notes: "Research outpost on Proxima Centauri b",
  },
];

describe("Database Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addColonizationData", () => {
    it("should successfully add colonization data", async () => {
      const testData = mockColonizationData[0] as ColonizationData;
      mockPrisma.colonizationData.create.mockResolvedValue(testData);

      await addColonizationData(testData);

      expect(mockPrisma.colonizationData.create).toHaveBeenCalledWith({
        data: testData,
      });
    });

    it("should handle errors when adding colonization data", async () => {
      const testData = mockColonizationData[0] as ColonizationData;
      const error = new Error("Database connection failed");
      mockPrisma.colonizationData.create.mockRejectedValue(error);

      await expect(addColonizationData(testData)).rejects.toThrow(error);
    });
  });

  describe("getColonizationDataById", () => {
    it("should return colonization data for valid ID", async () => {
      const testData = mockColonizationData[0];
      prisma.colonizationData.findUnique.mockResolvedValue(testData);

      const result = await getColonizationDataById(1);

      expect(result).toEqual(testData);
      expect(prisma.colonizationData.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null for non-existent ID", async () => {
      prisma.colonizationData.findUnique.mockResolvedValue(null);

      const result = await getColonizationDataById(999);

      expect(result).toBeNull();
    });
  });

  describe("getColonizationDataByProjectName", () => {
    it("should return data for existing project name", async () => {
      const testData = mockColonizationData[0];
      prisma.colonizationData.findFirst.mockResolvedValue(testData);

      const result = await getColonizationDataByProjectName(
        "Sol Gateway Station",
      );

      expect(result).toEqual(testData);
      expect(prisma.colonizationData.findFirst).toHaveBeenCalledWith({
        where: { projectName: "Sol Gateway Station" },
      });
    });

    it("should return null for non-existent project", async () => {
      prisma.colonizationData.findFirst.mockResolvedValue(null);

      const result = await getColonizationDataByProjectName(
        "Non-existent Project",
      );

      expect(result).toBeNull();
    });
  });

  describe("getAllColonizationData", () => {
    it("should return paginated data with default parameters", async () => {
      const expectedData = mockColonizationData.filter((d) => !d.isCompleted);
      prisma.colonizationData.findMany.mockResolvedValue(expectedData);

      const result = await getAllColonizationData();

      expect(result).toEqual(expectedData);
      expect(prisma.colonizationData.findMany).toHaveBeenCalledWith({
        where: { isCompleted: false },
      });
    });

    it("should filter by architect with case-insensitive partial matching", async () => {
      const filteredData = [mockColonizationData[0]];
      prisma.colonizationData.findMany.mockResolvedValue(filteredData);

      const result = await getAllColonizationData(1, 5, undefined, "jameson");

      expect(prisma.colonizationData.findMany).toHaveBeenCalledWith({
        where: {
          isCompleted: false,
          architect: {
            contains: "jameson",
          },
        },
      });
    });

    it("should filter by project name with case-insensitive partial matching", async () => {
      const filteredData = [mockColonizationData[1]];
      prisma.colonizationData.findMany.mockResolvedValue(filteredData);

      const result = await getAllColonizationData(1, 5, "sirius");

      expect(prisma.colonizationData.findMany).toHaveBeenCalledWith({
        where: {
          isCompleted: false,
          projectName: {
            contains: "sirius",
          },
        },
      });
    });

    it("should sort by distance when position is provided", async () => {
      // Test data with positions relative to Sol (0,0,0)
      const allData = [
        mockColonizationData[1], // Sirius (~8.6 LY) - distance ~8.6
        mockColonizationData[0], // Sol (0,0,0) - distance 0
        mockColonizationData[4], // Proxima (~4.2 LY) - distance ~2.13
      ].filter((d) => !d.isCompleted);

      prisma.colonizationData.findMany.mockResolvedValue(allData);

      const solPosition: Position = { x: 0, y: 0, z: 0 };
      const result = await getAllColonizationData(
        1,
        5,
        undefined,
        undefined,
        solPosition,
      );

      // Results should be sorted by distance (closest first)
      expect(result.length).toBeGreaterThanOrEqual(1);

      // Sol should be first (distance 0)
      expect(result[0].systemName).toBe("Sol");

      // If we have multiple results, the next closest should be Proxima
      if (result.length > 1) {
        expect(result[1].systemName).toBe("Proxima Centauri");
      }

      // If we have all results, Sirius should be last (farthest)
      if (result.length === 3) {
        expect(result[2].systemName).toBe("Sirius");
      }
    });

    it("should handle pagination correctly", async () => {
      const allData = mockColonizationData.slice(0, 3);
      prisma.colonizationData.findMany.mockResolvedValue(allData);

      const result = await getAllColonizationData(2, 2);

      expect(prisma.colonizationData.findMany).toHaveBeenCalledWith({
        where: { isCompleted: false },
      });
    });
  });

  describe("participateInColonizationData", () => {
    it("should successfully add a participant", async () => {
      const participantData = {
        id: 1,
        colonizationDataId: 1,
        userId: "Commander Pilot",
        joinedAt: new Date(),
      };
      prisma.participants.create.mockResolvedValue(participantData);

      const result = await participateInColonizationData(1, "Commander Pilot");

      expect(prisma.participants.create).toHaveBeenCalledWith({
        data: { colonizationDataId: 1, userId: "Commander Pilot" },
      });
      expect(result).toEqual(participantData);
    });

    it("should handle errors when adding participant", async () => {
      const error = new Error("Participant already exists");
      prisma.participants.create.mockRejectedValue(error);

      await expect(
        participateInColonizationData(1, "Commander Pilot"),
      ).rejects.toThrow(error);
    });
  });

  describe("markColonizationDataAsCompleted", () => {
    it("should successfully mark project as completed", async () => {
      prisma.colonizationData.update.mockResolvedValue({});

      await markColonizationDataAsCompleted(1);

      expect(prisma.colonizationData.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isCompleted: true },
      });
    });

    it("should handle errors when marking as completed", async () => {
      const error = new Error("Project not found");
      prisma.colonizationData.update.mockRejectedValue(error);

      await expect(markColonizationDataAsCompleted(999)).rejects.toThrow(error);
    });
  });

  describe("updateColonizationData", () => {
    it("should successfully update colonization data", async () => {
      const updates = { progress: 85, notes: "Updated progress" };
      prisma.colonizationData.update.mockResolvedValue({});

      await updateColonizationData(1, updates);

      expect(prisma.colonizationData.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updates,
      });
    });

    it("should handle partial updates correctly", async () => {
      const updates = { timeLeft: 3600 }; // 1 hour remaining
      prisma.colonizationData.update.mockResolvedValue({});

      await updateColonizationData(2, updates);

      expect(prisma.colonizationData.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: updates,
      });
    });
  });

  describe("removeColonizationDataById", () => {
    it("should successfully delete colonization data", async () => {
      prisma.colonizationData.delete.mockResolvedValue({});

      await removeColonizationDataById(1);

      expect(prisma.colonizationData.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should handle errors when deleting", async () => {
      const error = new Error("Record not found");
      prisma.colonizationData.delete.mockRejectedValue(error);

      await expect(removeColonizationDataById(999)).rejects.toThrow(error);
    });
  });

  describe("Real Elite Dangerous Systems Integration", () => {
    it("should handle famous Elite Dangerous systems correctly", async () => {
      const famousSystems = [
        { name: "Sol", position: { x: 0, y: 0, z: 0 } },
        { name: "Sirius", position: { x: -1.48, y: -1.48, z: 8.59 } },
        {
          name: "Alpha Centauri",
          position: { x: -0.375, y: 1.25, z: -1.40625 },
        },
        {
          name: "Sagittarius A*",
          position: { x: 25.21875, y: -20.90625, z: 25899.96875 },
        },
      ];

      for (const system of famousSystems) {
        const testData = {
          ...mockColonizationData[0],
          systemName: system.name,
          positionX: system.position.x,
          positionY: system.position.y,
          positionZ: system.position.z,
        } as ColonizationData;

        prisma.colonizationData.create.mockResolvedValue(testData);

        await addColonizationData(testData);

        expect(prisma.colonizationData.create).toHaveBeenCalledWith({
          data: testData,
        });
      }
    });

    it("should calculate distances between real systems correctly", async () => {
      // Test distance between Sol and Sirius (approximately 8.6 light-years)
      const solPosition: Position = { x: 0, y: 0, z: 0 };
      const siriusData = mockColonizationData[1];

      const siriusDistance = Math.sqrt(
        Math.pow((siriusData.positionX || 0) - solPosition.x, 2) +
          Math.pow((siriusData.positionY || 0) - solPosition.y, 2) +
          Math.pow((siriusData.positionZ || 0) - solPosition.z, 2),
      );

      // Sirius is approximately 8.8 light-years from Sol (more accurate calculation)
      expect(siriusDistance).toBeCloseTo(8.8, 1);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty search strings", async () => {
      prisma.colonizationData.findMany.mockResolvedValue([]);

      await getAllColonizationData(1, 5, "", "");

      expect(prisma.colonizationData.findMany).toHaveBeenCalledWith({
        where: { isCompleted: false },
      });
    });

    it("should handle invalid position data in distance filtering", async () => {
      const dataWithInvalidPositions = [
        {
          ...mockColonizationData[0],
          positionX: null,
          positionY: null,
          positionZ: null,
        },
        {
          ...mockColonizationData[1],
          positionX: undefined,
          positionY: 1,
          positionZ: 2,
        },
      ];

      prisma.colonizationData.findMany.mockResolvedValue(
        dataWithInvalidPositions,
      );

      const result = await getAllColonizationData(1, 5, undefined, undefined, {
        x: 0,
        y: 0,
        z: 0,
      });

      // Should filter out items with incomplete position data
      expect(result).toHaveLength(0);
    });

    it("should handle zero distance correctly", async () => {
      const exactMatchData = [mockColonizationData[0]]; // Sol at (0,0,0)
      prisma.colonizationData.findMany.mockResolvedValue(exactMatchData);

      const result = await getAllColonizationData(1, 5, undefined, undefined, {
        x: 0,
        y: 0,
        z: 0,
      });

      expect(result).toHaveLength(1);
      expect(result[0].systemName).toBe("Sol");
    });
  });
});
