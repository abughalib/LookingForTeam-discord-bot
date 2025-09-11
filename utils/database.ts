import { ColonizationData, PrismaClient } from "@prisma/client";
import { Position } from "./models";

const prisma = new PrismaClient();

export async function addColonizationData(
  colonization_data: ColonizationData
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
  id: number
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
  projectName: string
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
  position?: Position
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
              Math.pow(item.positionZ! - position.z, 2)
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
  colonizationId: number
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
  userId: string
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
  id: number
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
  updates: Partial<ColonizationData>
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
  projectName: string
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

export default prisma;
