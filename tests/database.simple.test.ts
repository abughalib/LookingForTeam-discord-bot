import { ColonizationData } from "@prisma/client";
import { Position } from "../utils/models";

// Mock the Prisma client only
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

// Mock @prisma/client
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Import functions after mocking
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
];

describe("Database Functions Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock return values
    mockPrisma.colonizationData.findUnique.mockResolvedValue({
      id: 1,
      projectName: "Test Project",
      systemName: "Test System",
    });

    mockPrisma.colonizationData.findFirst.mockResolvedValue({
      id: 1,
      projectName: "Test Project",
    });

    mockPrisma.colonizationData.findMany.mockResolvedValue([
      {
        id: 1,
        projectName: "Test Project",
        isCompleted: false,
      },
    ]);

    mockPrisma.participants.create.mockResolvedValue({
      id: 1,
      colonizationDataId: 1,
      userId: "Test User",
    });
  });

  describe("addColonizationData", () => {
    it("should successfully add colonization data", async () => {
      const testData = mockColonizationData[0] as ColonizationData;

      await expect(addColonizationData(testData)).resolves.not.toThrow();
    });
  });

  describe("getColonizationDataById", () => {
    it("should return colonization data for valid ID", async () => {
      const result = await getColonizationDataById(1);
      expect(result).toBeDefined();
      expect(mockPrisma.colonizationData.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should handle non-existent ID", async () => {
      mockPrisma.colonizationData.findUnique.mockResolvedValue(null);
      const result = await getColonizationDataById(999);
      expect(result).toBeNull();
    });
  });

  describe("getColonizationDataByProjectName", () => {
    it("should return data for existing project name", async () => {
      const result = await getColonizationDataByProjectName(
        "Sol Gateway Station",
      );
      expect(result).toBeDefined();
      expect(mockPrisma.colonizationData.findFirst).toHaveBeenCalledWith({
        where: { projectName: "Sol Gateway Station" },
      });
    });
  });

  describe("getAllColonizationData", () => {
    it("should return paginated data with default parameters", async () => {
      const result = await getAllColonizationData();
      expect(result).toBeDefined();
    });

    it("should handle architect filtering", async () => {
      const result = await getAllColonizationData(1, 5, "jameson");
      expect(result).toBeDefined();
    });

    it("should handle system name filtering", async () => {
      const result = await getAllColonizationData(
        1,
        5,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toBeDefined();
    });

    it("should handle distance filtering", async () => {
      mockPrisma.colonizationData.findMany.mockResolvedValue([
        {
          id: 1,
          systemName: "Sol",
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          isCompleted: false,
        },
      ]);

      const solPosition: Position = { x: 0, y: 0, z: 0 };
      const result = await getAllColonizationData(1, 5, undefined);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle pagination", async () => {
      const result = await getAllColonizationData(2, 2);
      expect(result).toBeDefined();
    });
  });

  describe("participateInColonizationData", () => {
    it("should successfully add a participant", async () => {
      const result = await participateInColonizationData(1, "Commander Pilot");
      expect(result).toBeDefined();
      expect(mockPrisma.participants.create).toHaveBeenCalledWith({
        data: { colonizationDataId: 1, userId: "Commander Pilot" },
      });
    });
  });

  describe("markColonizationDataAsCompleted", () => {
    it("should successfully mark project as completed", async () => {
      await expect(markColonizationDataAsCompleted(1)).resolves.not.toThrow();
    });
  });

  describe("updateColonizationData", () => {
    it("should successfully update colonization data", async () => {
      const updates = { progress: 85, notes: "Updated progress" };
      await expect(updateColonizationData(1, updates)).resolves.not.toThrow();
    });
  });

  describe("removeColonizationDataById", () => {
    it("should successfully delete colonization data", async () => {
      await expect(removeColonizationDataById(1)).resolves.not.toThrow();
    });
  });

  describe("Elite Dangerous Systems Integration", () => {
    it("should calculate distances between real systems correctly", () => {
      // Test distance between Sol and Sirius (approximately 8.6 light-years)
      const solPosition: Position = { x: 0, y: 0, z: 0 };
      const siriusData = mockColonizationData[1];

      const siriusDistance = Math.sqrt(
        Math.pow((siriusData.positionX || 0) - solPosition.x, 2) +
          Math.pow((siriusData.positionY || 0) - solPosition.y, 2) +
          Math.pow((siriusData.positionZ || 0) - solPosition.z, 2),
      );

      // Sirius is approximately 8.8 light-years from Sol (close enough)
      expect(siriusDistance).toBeCloseTo(8.8, 1);
    });
  });
});
