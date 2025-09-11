import {
  ColonizationData,
  PrismaClient,
  SystemInfoCache,
} from "@prisma/client";
import { Position, SystemInfo } from "./models";

const prisma = new PrismaClient();

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
    return await prisma.colonizationData.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching colonization data by ID:", error);
    throw error;
  }
}

export async function getColonizationDataByProjectName(
  projectName: string,
): Promise<ColonizationData | null> {
  try {
    return await prisma.colonizationData.findFirst({
      where: { projectName },
    });
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

    const allData = await prisma.colonizationData.findMany({
      where: whereClause,
    });

    // If position is provided, calculate distances and sort by distance
    if (position) {
      const dataWithDistance = allData
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
        .sort((a, b) => a.distance - b.distance); // Sort by distance ascending

      return dataWithDistance.slice(skip, skip + pageSize);
    }

    // If no position provided, use default sorting (timeLeft ASC, isPrimaryPort DESC)
    const sortedData = allData.sort((a, b) => {
      // First sort by timeLeft (ascending) - handle null values
      const aTimeLeft = a.timeLeft ?? 0;
      const bTimeLeft = b.timeLeft ?? 0;
      if (aTimeLeft !== bTimeLeft) {
        return aTimeLeft - bTimeLeft;
      }
      // Then sort by isPrimaryPort (descending - primary ports first)
      return b.isPrimaryPort === a.isPrimaryPort ? 0 : b.isPrimaryPort ? 1 : -1;
    });

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
    const participants = await prisma.participants.findMany({
      where: { colonizationDataId: colonizationId },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  } catch (error) {
    console.error("Error fetching participants by colonization ID:", error);
    throw error;
  }
}

export async function countColonizationActiveProjects(): Promise<number> {
  try {
    return await prisma.colonizationData.count({
      where: { isCompleted: false },
    });
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
    return await prisma.participants.create({
      data: { colonizationDataId: colonizationId, userId: userId },
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

export default prisma;
