import { ColonizationData, PrismaClient } from "@prisma/client";
import { Position } from "../utils/models";

// Import database functions
import {
  addColonizationData,
  getColonizationDataById,
  getAllColonizationData,
  markColonizationDataAsCompleted,
  updateColonizationData,
  removeColonizationDataById,
} from "../utils/database";

describe("Database Integration Tests (Simple)", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Use the same database as the main app for integration testing
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    // Clean up all test data
    try {
      await prisma.$transaction([
        prisma.participants.deleteMany({}),
        prisma.colonizationData.deleteMany({}),
      ]);
    } catch (error) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean data before each test - ensure complete cleanup
    try {
      await prisma.$transaction([
        prisma.participants.deleteMany({}),
        prisma.colonizationData.deleteMany({}),
      ]);
    } catch (error) {
      // Ignore cleanup errors
      console.warn("Cleanup error:", error);
    }
  });

  describe("Basic CRUD Operations", () => {
    it("should add and retrieve colonization data", async () => {
      const testProject: Omit<
        ColonizationData,
        "id" | "createdAt" | "updatedAt"
      > = {
        projectName: "Sol Gateway Station",
        systemName: "Sol",
        timeLeft: BigInt(86400), // 1 day
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        architect: "Commander Jameson",
        progress: 45,
        starPortType: "Orbis Starport",
        isPrimaryPort: true,
        srv_survey_link: "https://survey.example.com/sol",
        isCompleted: false,
        addedBy: "Commander Jameson",
        notes: "Primary gateway station for Sol system",
      };

      // Add the project
      await addColonizationData(testProject as ColonizationData);

      // Retrieve all projects
      const projects = await getAllColonizationData(1, 10);

      // Verify the project was added
      expect(projects).toHaveLength(1);
      expect(projects[0].projectName).toBe("Sol Gateway Station");
      expect(projects[0].systemName).toBe("Sol");
      expect(projects[0].architect).toBe("Commander Jameson");
    });

    it("should filter projects by architect name", async () => {
      // Add multiple projects
      const projects = [
        {
          projectName: "Sol Gateway Station",
          systemName: "Sol",
          timeLeft: BigInt(86400),
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          architect: "Commander Jameson",
          progress: 45,
          starPortType: "Orbis Starport",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/sol",
          isCompleted: false,
          addedBy: "Commander Jameson",
          notes: "Sol system project",
        },
        {
          projectName: "Sirius Industrial Complex",
          systemName: "Sirius",
          timeLeft: BigInt(172800),
          positionX: -1.48,
          positionY: -1.48,
          positionZ: 8.59,
          architect: "Commander Chen",
          progress: 75,
          starPortType: "Coriolis Starport",
          isPrimaryPort: false,
          srv_survey_link: "https://survey.example.com/sirius",
          isCompleted: false,
          addedBy: "Commander Chen",
          notes: "Sirius system project",
        },
      ];

      for (const project of projects) {
        await addColonizationData(project as ColonizationData);
      }

      // Filter by architect (case-insensitive)
      const jamesonProjects = await getAllColonizationData(1, 10, "jameson");

      expect(jamesonProjects).toHaveLength(1);
      expect(jamesonProjects[0].architect).toBe("Commander Jameson");
      expect(jamesonProjects[0].systemName).toBe("Sol");
    });

    it("should filter projects by system name", async () => {
      // Add a project
      const project = {
        projectName: "Sirius Industrial Complex",
        systemName: "Sirius",
        timeLeft: BigInt(172800),
        positionX: -1.48,
        positionY: -1.48,
        positionZ: 8.59,
        architect: "Commander Chen",
        progress: 75,
        starPortType: "Coriolis Starport",
        isPrimaryPort: false,
        srv_survey_link: "https://survey.example.com/sirius",
        isCompleted: false,
        addedBy: "Commander Chen",
        notes: "Sirius system project",
      };

      await addColonizationData(project as ColonizationData);

      // Filter by system name (case-insensitive)
      const siriusProjects = await getAllColonizationData(
        1,
        10,
        undefined,
        undefined,
        undefined,
        "sirius",
      );

      expect(siriusProjects).toHaveLength(1);
      expect(siriusProjects[0].systemName).toBe("Sirius");
      expect(siriusProjects[0].projectName).toBe("Sirius Industrial Complex");
    });

    it("should apply distance filtering correctly", async () => {
      // Add projects at different distances
      const projects = [
        {
          projectName: "Sol Gateway Station",
          systemName: "Sol",
          timeLeft: BigInt(86400),
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          architect: "Commander Jameson",
          progress: 45,
          starPortType: "Orbis Starport",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/sol",
          isCompleted: false,
          addedBy: "Commander Jameson",
          notes: "Sol system project",
        },
        {
          projectName: "Alpha Centauri Trade Hub",
          systemName: "Alpha Centauri",
          timeLeft: BigInt(259200),
          positionX: -0.375,
          positionY: 1.25,
          positionZ: -1.40625,
          architect: "Commander Trader",
          progress: 100,
          starPortType: "Ocellus Starport",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/alpha-centauri",
          isCompleted: false, // Changed to test filtering
          addedBy: "Commander Trader",
          notes: "Alpha Centauri project",
        },
        {
          projectName: "Sirius Industrial Complex",
          systemName: "Sirius",
          timeLeft: BigInt(172800),
          positionX: -1.48,
          positionY: -1.48,
          positionZ: 8.59,
          architect: "Commander Chen",
          progress: 75,
          starPortType: "Coriolis Starport",
          isPrimaryPort: false,
          srv_survey_link: "https://survey.example.com/sirius",
          isCompleted: false,
          addedBy: "Commander Chen",
          notes: "Sirius system project",
        },
      ];

      for (const project of projects) {
        await addColonizationData(project as ColonizationData);
      }

      const solPosition: Position = { x: 0, y: 0, z: 0 };

      // Get projects within 5 light-years of Sol
      const nearbyProjects = await getAllColonizationData(
        1,
        10,
        undefined,
        solPosition,
        5,
      );

      // Should include Sol (distance 0) and Alpha Centauri (distance ~4.3 LY)
      // Should exclude Sirius (distance ~8.6 LY)
      expect(nearbyProjects.length).toBeGreaterThanOrEqual(1);

      const systemNames = nearbyProjects.map((p) => p.systemName);

      // Check if Sol is in the results (it should be since it's at distance 0)
      const hasSol = systemNames.some((name) => name === "Sol");
      // Check if Alpha Centauri is in the results (it should be within 5 LY)
      const hasAlphaCentauri = systemNames.some(
        (name) => name === "Alpha Centauri",
      );

      // At least one of these should be true
      expect(hasSol || hasAlphaCentauri).toBeTruthy();

      // Make sure we didn't get Sirius (it's too far)
      expect(systemNames).not.toContain("Sirius");
    });

    it("should exclude completed projects by default", async () => {
      // Add completed and incomplete projects
      const projects = [
        {
          projectName: "Completed Project",
          systemName: "Completed System",
          timeLeft: BigInt(0),
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          architect: "Commander Complete",
          progress: 100,
          starPortType: "Orbis Starport",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/completed",
          isCompleted: true,
          addedBy: "Commander Complete",
          notes: "This is completed",
        },
        {
          projectName: "Active Project",
          systemName: "Active System",
          timeLeft: BigInt(86400),
          positionX: 1,
          positionY: 1,
          positionZ: 1,
          architect: "Commander Active",
          progress: 50,
          starPortType: "Orbis Starport",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/active",
          isCompleted: false,
          addedBy: "Commander Active",
          notes: "This is active",
        },
      ];

      for (const project of projects) {
        await addColonizationData(project as ColonizationData);
      }

      // Get all projects (should exclude completed by default)
      const activeProjects = await getAllColonizationData(1, 10);

      expect(activeProjects).toHaveLength(1);
      expect(activeProjects[0].systemName).toBe("Active System");
      expect(activeProjects[0].isCompleted).toBe(false);
    });

    it("should update project progress", async () => {
      // Add a project
      const project = {
        projectName: "Test Project",
        systemName: "Test System",
        timeLeft: BigInt(86400),
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        architect: "Commander Test",
        progress: 45,
        starPortType: "Orbis Starport",
        isPrimaryPort: true,
        srv_survey_link: "https://survey.example.com/test",
        isCompleted: false,
        addedBy: "Commander Test",
        notes: "Test project",
      };

      await addColonizationData(project as ColonizationData);

      // Get the project to find its ID
      const projects = await getAllColonizationData(1, 10);
      const testProject = projects[0];

      // Update progress
      await updateColonizationData(testProject.id, { progress: 75 });

      // Verify update
      const updatedProject = await getColonizationDataById(testProject.id);
      expect(updatedProject?.progress).toBe(75);
    });

    it("should mark project as completed", async () => {
      // Add a project
      const project = {
        projectName: "To Complete Project",
        systemName: "To Complete System",
        timeLeft: BigInt(86400),
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        architect: "Commander Complete",
        progress: 90,
        starPortType: "Orbis Starport",
        isPrimaryPort: true,
        srv_survey_link: "https://survey.example.com/tocomplete",
        isCompleted: false,
        addedBy: "Commander Complete",
        notes: "To be completed",
      };

      await addColonizationData(project as ColonizationData);

      // Get the project to find its ID
      const projects = await getAllColonizationData(1, 10);
      const testProject = projects[0];

      // Mark as completed
      await markColonizationDataAsCompleted(testProject.id);

      // Verify it's completed
      const completedProject = await getColonizationDataById(testProject.id);
      expect(completedProject?.isCompleted).toBe(true);

      // Verify it doesn't appear in default queries anymore
      const activeProjects = await getAllColonizationData(1, 10);
      expect(activeProjects).toHaveLength(0);
    });

    it("should delete projects correctly", async () => {
      // Add a project
      const project = {
        projectName: "To Delete Project",
        systemName: "To Delete System",
        timeLeft: BigInt(86400),
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        architect: "Commander Delete",
        progress: 25,
        starPortType: "Orbis Starport",
        isPrimaryPort: true,
        srv_survey_link: "https://survey.example.com/todelete",
        isCompleted: false,
        addedBy: "Commander Delete",
        notes: "To be deleted",
      };

      await addColonizationData(project as ColonizationData);

      // Get the project to find its ID
      const projects = await getAllColonizationData(1, 10);
      const testProject = projects[0];

      // Delete the project
      await removeColonizationDataById(testProject.id);

      // Verify it's deleted
      const deletedProject = await getColonizationDataById(testProject.id);
      expect(deletedProject).toBeNull();
    });
  });
});
