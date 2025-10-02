import { ColonizationData, PrismaClient } from "@prisma/client";
import { Position, SystemInfo } from "./models";
import { AppSettings } from "./settings";
import { RavenColonialProgress } from "./ravenTypes";

const prisma = new PrismaClient();

/**
 * Calculate dynamic time left for a colonization project
 * @param project ColonizationData object
 * @returns Remaining time in seconds (0 for infinite, negative for expired)
 */
export function calculateDynamicTimeLeft(project: ColonizationData): number {
  // If original timeLeft was 0 (infinite), keep it as 0
  if (project.timeLeft === 0 || project.timeLeft === null) return 0;

  const now = new Date();
  const createdAt = new Date(project.createdAt);
  const timeElapsed = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

  return project.timeLeft - timeElapsed;
}

/**
 * Apply dynamic timeLeft calculation to a single project
 * @param project ColonizationData object
 * @returns Project with updated timeLeft
 */
export function applyDynamicTimeLeft(
  project: ColonizationData,
): ColonizationData {
  return {
    ...project,
    timeLeft: calculateDynamicTimeLeft(project),
  };
}

/**
 * Apply dynamic timeLeft calculation to multiple projects
 * @param projects Array of ColonizationData objects
 * @returns Projects with updated timeLeft
 */
export function applyDynamicTimeLeftToArray(
  projects: ColonizationData[],
): ColonizationData[] {
  return projects.map(applyDynamicTimeLeft);
}

export async function addColonizationData(
  colonization_data: Omit<ColonizationData, "id">,
): Promise<number> {
  try {
    const result = await prisma.colonizationData.create({
      data: colonization_data,
    });
    return result.id;
  } catch (error) {
    console.error("Error adding colonization data:", error);
    throw error;
  }
}

export async function getColonizationDataById(
  id: number,
): Promise<ColonizationData | null> {
  try {
    const result = await prisma.colonizationData.findUnique({
      where: { id },
    });

    if (!result) return null;

    return applyDynamicTimeLeft(result);
  } catch (error) {
    console.error("Error fetching colonization data by ID:", error);
    throw error;
  }
}

export async function getColonizationDataByProjectName(
  projectName: string,
): Promise<ColonizationData | null> {
  try {
    const result = await prisma.colonizationData.findFirst({
      where: { projectName },
    });

    if (!result) return null;

    return applyDynamicTimeLeft(result);
  } catch (error) {
    console.error("Error fetching colonization data by project name:", error);
    throw error;
  }
}

export async function getAllColonizationData(
  page: number = 1,
  pageSize: number = 5,
  projectName?: string,
  architect?: string,
  position?: Position,
  isPrimaryPort?: boolean,
  starPortType?: string,
): Promise<ColonizationData[]> {
  try {
    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      isCompleted: false,
    };

    if (architect && architect.trim() !== "") {
      whereClause.architect = {
        contains: architect,
      };
    }

    if (projectName && projectName.trim() !== "") {
      whereClause.projectName = {
        contains: projectName,
      };
    }

    if (isPrimaryPort !== undefined) {
      whereClause.isPrimaryPort = isPrimaryPort;
    }

    if (starPortType && starPortType.trim() !== "") {
      whereClause.starPortType = starPortType;
    }

    const allData = await prisma.colonizationData.findMany({
      where: whereClause,
    });

    // Apply dynamic timeLeft calculation to all projects
    const dataWithDynamicTime = applyDynamicTimeLeftToArray(allData);

    // Filter out expired projects (timeLeft <= 0, but keep infinite projects with timeLeft = 0)
    const activeProjects = dataWithDynamicTime.filter((project) => {
      // Keep projects with timeLeft = 0 (infinite) or timeLeft > 0 (still has time)
      const timeLeft = project.timeLeft ?? 0;
      return timeLeft === 0 || timeLeft > 0;
    });

    // Helper function to create multi-level sort comparison
    const createSortComparator = (withDistance: boolean = false) => {
      return (a: any, b: any) => {
        // 1. Distance (if position provided) - closer first
        if (withDistance && a.distance !== b.distance) {
          return a.distance - b.distance;
        }

        // 2. Time Left - less time first, but 0 is treated as infinite (last)
        const aTimeLeft = a.timeLeft ?? 0;
        const bTimeLeft = b.timeLeft ?? 0;

        // Handle 0 as infinite - move to end
        const aTimeLeftSortValue =
          aTimeLeft === 0 ? Number.MAX_SAFE_INTEGER : aTimeLeft;
        const bTimeLeftSortValue =
          bTimeLeft === 0 ? Number.MAX_SAFE_INTEGER : bTimeLeft;

        if (aTimeLeftSortValue !== bTimeLeftSortValue) {
          return aTimeLeftSortValue - bTimeLeftSortValue;
        }

        // 3. Is Primary Port - primary ports first (descending)
        if (a.isPrimaryPort !== b.isPrimaryPort) {
          return b.isPrimaryPort ? 1 : -1;
        }

        // 4. Progress - less progress first (ascending)
        const aProgress = a.progress ?? 0;
        const bProgress = b.progress ?? 0;
        if (aProgress !== bProgress) {
          return aProgress - bProgress;
        }

        // If all criteria are equal, maintain original order
        return 0;
      };
    };

    // If position is provided, calculate distances and apply full sorting
    if (position) {
      const dataWithDistance = activeProjects
        .filter((item) => {
          // Filter out items with incomplete position data
          return (
            item.positionX !== null &&
            item.positionX !== undefined &&
            item.positionY !== null &&
            item.positionY !== undefined &&
            item.positionZ !== null &&
            item.positionZ !== undefined
          );
        })
        .map((item) => {
          const euclideanDistance = Math.sqrt(
            Math.pow(item.positionX! - position.x, 2) +
              Math.pow(item.positionY! - position.y, 2) +
              Math.pow(item.positionZ! - position.z, 2),
          );

          return {
            ...item,
            distance: euclideanDistance,
          };
        })
        .sort(createSortComparator(true)); // Sort with distance priority

      return dataWithDistance.slice(skip, skip + pageSize);
    }

    // If no position provided, use sorting without distance
    const sortedData = activeProjects.sort(createSortComparator(false));

    return sortedData.slice(skip, skip + pageSize);
  } catch (error) {
    console.error("Error fetching colonization data:", error);
    throw error;
  }
}

export async function getParticipantsByColonizationId(
  colonizationId: number,
): Promise<string[]> {
  try {
    const participantProjects = await prisma.participantOnProject.findMany({
      where: { colonizationDataId: colonizationId },
      include: { participant: true },
    });
    return participantProjects.map((pp) => pp.participant.userId);
  } catch (error) {
    console.error("Error fetching participants by colonization ID:", error);
    throw error;
  }
}

export async function countColonizationActiveProjects(): Promise<number> {
  try {
    // Get all non-completed projects
    const allProjects = await prisma.colonizationData.findMany({
      where: { isCompleted: false },
    });

    // Apply dynamic timeLeft calculation and filter out expired projects
    const dataWithDynamicTime = applyDynamicTimeLeftToArray(allProjects);
    const activeProjects = dataWithDynamicTime.filter((project) => {
      const timeLeft = project.timeLeft ?? 0;
      return timeLeft === 0 || timeLeft > 0;
    });

    return activeProjects.length;
  } catch (error) {
    console.error("Error counting active colonization projects:", error);
    throw error;
  }
}

export async function participateInColonizationData(
  colonizationId: number,
  userId: string,
): Promise<any> {
  try {
    return await prisma.$transaction(async (tx) => {
      // First, get or create the participant
      const participant = await tx.participant.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      // Then create the relationship in ParticipantOnProject
      return await tx.participantOnProject.create({
        data: {
          participantId: participant.id,
          colonizationDataId: colonizationId,
        },
      });
    });
  } catch (error) {
    console.error("Error creating participant:", error);
    throw error;
  }
}

export async function markColonizationDataAsCompleted(
  id: number,
): Promise<void> {
  try {
    await prisma.colonizationData.update({
      where: { id },
      data: { isCompleted: true },
    });
  } catch (error) {
    console.error("Error marking colonization data as completed:", error);
    throw error;
  }
}

export async function updateColonizationData(
  id: number,
  updates: Partial<ColonizationData>,
): Promise<void> {
  try {
    await prisma.colonizationData.update({
      where: { id },
      data: updates,
    });
  } catch (error) {
    console.error("Error updating colonization data:", error);
    throw error;
  }
}

export async function removeColonizationDataById(id: number): Promise<void> {
  try {
    await prisma.colonizationData.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error removing colonization data:", error);
    throw error;
  }
}

export async function removeColonizationDataByProjectName(
  projectName: string,
): Promise<void> {
  try {
    await prisma.colonizationData.deleteMany({
      where: { projectName },
    });
  } catch (error) {
    console.error("Error removing colonization data by project name:", error);
    throw error;
  }
}

export async function getSystemInfoFromCache(
  systemName: string,
): Promise<SystemInfo | null> {
  try {
    const cached = await prisma.systemInfoCache.findUnique({
      where: { systemName: systemName.toLowerCase() },
    });

    if (!cached) {
      return null;
    }

    return {
      name: cached.systemName,
      coords: {
        x: cached.positionX,
        y: cached.positionY,
        z: cached.positionZ,
      },
      coordsLocked: cached.coordsLocked,
    };
  } catch (error) {
    console.error("Error fetching system info from cache:", error);
    throw error;
  }
}

export async function getSystemInfoFromCacheWithAge(
  systemName: string,
  maxAgeHours: number = 24,
): Promise<{ systemInfo: SystemInfo | null; isExpired: boolean }> {
  try {
    const cached = await prisma.systemInfoCache.findUnique({
      where: { systemName: systemName.toLowerCase() },
    });

    if (!cached) {
      return { systemInfo: null, isExpired: false };
    }

    const now = new Date();
    const cacheAge = now.getTime() - cached.updatedAt.getTime();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const isExpired = cacheAge > maxAge;

    const systemInfo: SystemInfo = {
      name: cached.systemName,
      coords: {
        x: cached.positionX,
        y: cached.positionY,
        z: cached.positionZ,
      },
      coordsLocked: cached.coordsLocked,
    };

    return { systemInfo, isExpired };
  } catch (error) {
    console.error("Error fetching system info from cache with age:", error);
    throw error;
  }
}

export async function cacheSystemInfo(systemInfo: SystemInfo): Promise<void> {
  try {
    await prisma.systemInfoCache.upsert({
      where: { systemName: systemInfo.name.toLowerCase() },
      update: {
        positionX: systemInfo.coords.x,
        positionY: systemInfo.coords.y,
        positionZ: systemInfo.coords.z,
        coordsLocked: systemInfo.coordsLocked,
        updatedAt: new Date(),
      },
      create: {
        systemName: systemInfo.name.toLowerCase(),
        positionX: systemInfo.coords.x,
        positionY: systemInfo.coords.y,
        positionZ: systemInfo.coords.z,
        coordsLocked: systemInfo.coordsLocked,
      },
    });
  } catch (error) {
    console.error("Error caching system info:", error);
    throw error;
  }
}

export async function clearSystemInfoCache(): Promise<void> {
  try {
    await prisma.systemInfoCache.deleteMany({});
  } catch (error) {
    console.error("Error clearing system info cache:", error);
    throw error;
  }
}

export async function removeParticipantFromProject(
  colonizationId: number,
  userId: string,
): Promise<void> {
  try {
    const participant = await prisma.participant.findUnique({
      where: { userId },
    });

    if (!participant) {
      throw new Error("Participant not found");
    }

    await prisma.participantOnProject.delete({
      where: {
        participantId_colonizationDataId: {
          participantId: participant.id,
          colonizationDataId: colonizationId,
        },
      },
    });
  } catch (error) {
    console.error("Error removing participant from project:", error);
    throw error;
  }
}

export async function getSystemInfoCacheStats(): Promise<{
  totalEntries: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  try {
    const stats = await prisma.systemInfoCache.aggregate({
      _count: { id: true },
      _min: { createdAt: true },
      _max: { updatedAt: true },
    });

    return {
      totalEntries: stats._count.id || 0,
      oldestEntry: stats._min.createdAt,
      newestEntry: stats._max.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching cache stats:", error);
    throw error;
  }
}

export async function cacheColonizationProgress(
  buildId: string,
  data: RavenColonialProgress,
): Promise<void> {
  try {
    await prisma.ravenColonialCache.upsert({
      where: { buildId },
      update: {
        data: JSON.stringify(data),
        updatedAt: new Date(),
      },
      create: {
        buildId,
        data: JSON.stringify(data),
      },
    });
  } catch (error) {
    console.error("Error caching RavenColonial progress:", error);
    throw error;
  }
}

export async function getColonizationProgressCache(
  buildId: string,
): Promise<RavenColonialProgress | null> {
  try {
    const cached = await prisma.ravenColonialCache.findUnique({
      where: { buildId: buildId },
    });

    if (cached) {
      const now = new Date();
      const cacheAge = now.getTime() - cached.updatedAt.getTime();
      const maxAge = AppSettings.DAFAULT_RAVENCOLONIAL_TIMEOUT_AGE; // 6 hours in milliseconds

      if (cacheAge <= maxAge) {
        return JSON.parse(cached.data) as RavenColonialProgress;
      }
    }
  } catch (error) {
    console.error("Error fetching RavenColonial progress:", error);
    throw error;
  }
  return null;
}

export default prisma;
