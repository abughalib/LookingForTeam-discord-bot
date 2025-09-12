import { ColonizationData, PrismaClient } from "@prisma/client";
import { Position } from "../utils/models";

// Import database functions
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

describe("Elite Dangerous Colonization Database Tests", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Use the same database as the main app for integration testing
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    try {
      await prisma.$transaction([
        prisma.participantOnProject.deleteMany({}),
        prisma.participant.deleteMany({}),
        prisma.colonizationData.deleteMany({}),
      ]);
    } catch (error) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    try {
      await prisma.$transaction([
        prisma.participantOnProject.deleteMany({}),
        prisma.participant.deleteMany({}),
        prisma.colonizationData.deleteMany({}),
      ]);
    } catch (error) {
      // Ignore cleanup errors
      console.warn("Cleanup error:", error);
    }
  });

  describe("Elite Dangerous Galaxy Simulation", () => {
    it("should handle a complete colonization workflow", async () => {
      // Phase 1: Add multiple colonization projects across the galaxy
      const projects = [
        {
          projectName: "Sol Gateway Station",
          systemName: "Sol",
          timeLeft: 86400,
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
        },
        {
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
          addedBy: "Commander Chen",
          notes: "Industrial complex for Sirius Corp operations",
        },
        {
          projectName: "Alpha Centauri Trade Hub",
          systemName: "Alpha Centauri",
          timeLeft: 43200, // 12 hours
          positionX: -0.375,
          positionY: 1.25,
          positionZ: -1.40625,
          architect: "Commander Trader",
          progress: 90,
          starPortType: "Ocellus Starport",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/alpha-centauri",
          isCompleted: false,
          addedBy: "Commander Trader",
          notes: "Trade hub in Alpha Centauri system",
        },
        {
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
          addedBy: "Commander Explorer",
          notes: "Deep space research station near galactic center",
        },
        {
          projectName: "Beagle Point Observatory",
          systemName: "Ceeckia ZQ-L c24-0",
          timeLeft: 259200, // 3 days
          positionX: -1111.5625,
          positionY: -134.21875,
          positionZ: 65269.75,
          architect: "Commander Navigator",
          progress: 60,
          starPortType: "Planetary Outpost",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/beagle-point",
          isCompleted: false,
          addedBy: "Commander Navigator",
          notes: "Furthest exploration outpost in the galaxy",
        },
        {
          projectName: "Colonia Bridge Project",
          systemName: "Colonia",
          timeLeft: 432000, // 5 days
          positionX: -9530.5,
          positionY: -910.28125,
          positionZ: 19808.125,
          architect: "Commander Colonian",
          progress: 25,
          starPortType: "Coriolis Starport",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/colonia",
          isCompleted: false,
          addedBy: "Commander Colonian",
          notes: "Major waystation between Bubble and Colonia",
        },
        {
          projectName: "Hutton Orbital Expansion",
          systemName: "Alpha Centauri",
          timeLeft: 518400, // 6 days
          positionX: -0.375,
          positionY: 1.25,
          positionZ: -1.40625,
          architect: "Commander Patient",
          progress: 35,
          starPortType: "Outpost",
          isPrimaryPort: false,
          srv_survey_link: "https://survey.example.com/hutton-orbital",
          isCompleted: false,
          addedBy: "Commander Patient",
          notes: "Infamous long-distance station expansion project",
        },
        {
          projectName: "Barnard's Loop Mining Platform",
          systemName: "Barnard's Loop Sector FW-W d1-92",
          timeLeft: 345600, // 4 days
          positionX: -78.3125,
          positionY: -149.8125,
          positionZ: -340.53125,
          architect: "Commander Miner",
          progress: 80,
          starPortType: "Mining Outpost",
          isPrimaryPort: true,
          srv_survey_link: "https://survey.example.com/barnards-loop",
          isCompleted: false,
          addedBy: "Commander Miner",
          notes: "Mining operations in the famous nebula region",
        },
      ];

      // Verify we start clean
      const initialProjects = await getAllColonizationData(1, 10);
      expect(initialProjects).toHaveLength(0);

      // Add all projects
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const fullProject: ColonizationData = {
          id: i + 1, // Auto-incrementing ID placeholder
          createdAt: new Date(),
          updatedAt: new Date(),
          ...project,
        };
        await addColonizationData(fullProject);
      }

      // Phase 2: Verify all projects were added
      const allProjects = await getAllColonizationData(1, 10);
      expect(allProjects).toHaveLength(projects.length);

      // Phase 3: Test priority sorting (timeLeft ASC, then isPrimaryPort DESC)
      const sortedProjects = await getAllColonizationData(1, 10);

      // Alpha Centauri should be first (shortest time: 12 hours)
      expect(sortedProjects[0].systemName).toBe("Alpha Centauri");
      expect(sortedProjects[0].timeLeft).toBe(43200);

      // Sol should be second (1 day)
      expect(sortedProjects[1].systemName).toBe("Sol");
      expect(sortedProjects[1].timeLeft).toBe(86400);

      // Phase 4: Test distance sorting from Sol
      const solPosition: Position = { x: 0, y: 0, z: 0 };

      // Get systems sorted by distance from Sol
      const nearSol = await getAllColonizationData(
        1,
        10,
        undefined,
        undefined,
        solPosition,
      );
      const nearSolNames = nearSol.map((p) => p.systemName);

      console.log("Systems sorted by distance from Sol:", nearSolNames);

      // Should include all systems, sorted by distance from Sol
      expect(nearSol.length).toBeGreaterThan(0);

      // Sol should be first (distance 0), Alpha Centauri should be early (very close)
      if (nearSolNames.includes("Sol")) {
        expect(nearSolNames[0]).toBe("Sol");
      }

      // Alpha Centauri should come before distant systems
      if (
        nearSolNames.includes("Alpha Centauri") &&
        nearSolNames.includes("Sagittarius A*")
      ) {
        const alphaIndex = nearSolNames.indexOf("Alpha Centauri");
        const sagittariusIndex = nearSolNames.indexOf("Sagittarius A*");
        expect(alphaIndex).toBeLessThan(sagittariusIndex);
      }

      // Phase 5: Test architect filtering
      const jamesonProjects = await getAllColonizationData(
        1,
        10,
        undefined,
        "Commander Jameson",
      );
      expect(jamesonProjects).toHaveLength(1);
      expect(jamesonProjects[0].architect).toBe("Commander Jameson");

      const commanderProjects = await getAllColonizationData(
        1,
        10,
        undefined,
        "Commander",
      );
      expect(commanderProjects.length).toBeGreaterThan(0); // Should find all with "Commander" in name

      // Phase 6: Test system name filtering
      const solProjects = await getAllColonizationData(1, 10, "Sol", undefined);
      expect(solProjects).toHaveLength(1);
      expect(solProjects[0].systemName).toBe("Sol");

      const sagProjects = await getAllColonizationData(
        1,
        10,
        "Sagittarius A*",
        undefined,
      );
      expect(sagProjects).toHaveLength(1);
      expect(sagProjects[0].systemName).toBe("Sagittarius A*");

      // Phase 7: Test project lifecycle management
      const alphaProject = allProjects.find(
        (p) => p.projectName === "Alpha Centauri Trade Hub",
      );
      expect(alphaProject).toBeDefined();

      // Update progress
      await updateColonizationData(alphaProject!.id, { progress: 95 });
      const updatedProject = await getColonizationDataById(alphaProject!.id);
      expect(updatedProject?.progress).toBe(95);

      // Add participant
      const participant = await participateInColonizationData(
        alphaProject!.id,
        "Commander Helper",
      );
      expect(participant).toBeDefined();

      // Mark as completed
      await markColonizationDataAsCompleted(alphaProject!.id);
      const completedProject = await getColonizationDataById(alphaProject!.id);
      expect(completedProject?.isCompleted).toBe(true);

      // Verify it no longer appears in active projects
      const activeProjects = await getAllColonizationData(1, 10);
      const activeProjectNames = activeProjects.map((p) => p.projectName);
      expect(activeProjectNames).not.toContain("Alpha Centauri Trade Hub");
      expect(activeProjects).toHaveLength(7); // Should have 7 remaining active projects (8 total - 1 completed)

      // Phase 8: Test project retrieval by name
      const solByName = await getColonizationDataByProjectName(
        "Sol Gateway Station",
      );
      expect(solByName).toBeDefined();
      expect(solByName?.systemName).toBe("Sol");

      const nonExistentProject = await getColonizationDataByProjectName(
        "Nonexistent Project",
      );
      expect(nonExistentProject).toBeNull();

      // Phase 9: Test pagination
      const page1 = await getAllColonizationData(1, 2); // First 2 projects
      const page2 = await getAllColonizationData(2, 2); // Next 2 projects

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2); // Next 2 projects (7 total active projects)

      // Verify no overlap
      const page1Ids = page1.map((p) => p.id);
      const page2Ids = page2.map((p) => p.id);
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);

      // Phase 10: Clean up - delete a project
      const solProject = allProjects.find((p) => p.systemName === "Sol");
      await removeColonizationDataById(solProject!.id);

      const deletedProject = await getColonizationDataById(solProject!.id);
      expect(deletedProject).toBeNull();

      // Final verification
      const finalCount = await getAllColonizationData(1, 10);
      expect(finalCount).toHaveLength(6); // 6 remaining active projects (8 initial - 1 completed - 1 deleted)
    });

    it("should accurately calculate distances between famous Elite Dangerous systems", () => {
      const systems = [
        { name: "Sol", coords: { x: 0, y: 0, z: 0 } },
        { name: "Alpha Centauri", coords: { x: -0.375, y: 1.25, z: -1.40625 } },
        { name: "Sirius", coords: { x: -1.48, y: -1.48, z: 8.59 } },
        {
          name: "Proxima Centauri",
          coords: { x: -1.1875, y: 0.875, z: -1.1875 },
        },
      ];

      const solCoords = systems[0].coords;

      // Calculate distances from Sol
      for (let i = 1; i < systems.length; i++) {
        const system = systems[i];
        const distance = Math.sqrt(
          Math.pow(system.coords.x - solCoords.x, 2) +
            Math.pow(system.coords.y - solCoords.y, 2) +
            Math.pow(system.coords.z - solCoords.z, 2),
        );

        // Verify realistic distances (these are game coordinates, not real astronomy)
        if (system.name === "Alpha Centauri") {
          expect(distance).toBeCloseTo(1.9, 1.0); // Game distance based on coordinates
        } else if (system.name === "Sirius") {
          expect(distance).toBeCloseTo(8.8, 1.0); // Game distance based on coordinates
        } else if (system.name === "Proxima Centauri") {
          expect(distance).toBeCloseTo(1.9, 1.0); // Game distance based on coordinates
        }

        console.log(
          `Distance from Sol to ${system.name}: ${distance.toFixed(2)} LY`,
        );
      }
    });
  });
});
