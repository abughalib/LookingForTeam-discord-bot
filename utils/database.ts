import { ColonizationData, PrismaClient } from "@prisma/client";
import { Position } from "./models";

const prisma = new PrismaClient();

export async function addColonizationData(
  colonization_data: ColonizationData,
): Promise<void> {
  try {
    await prisma.colonizationData.create({
      data: colonization_data,
    });
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
  architect?: string,
  position?: Position,
  distance?: number,
  referenceSystem?: string,
): Promise<ColonizationData[]> {
  try {
    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      isCompleted: false,
    };

    if (referenceSystem && referenceSystem.trim() !== "") {
      whereClause.systemName = {
        contains: referenceSystem,
      };
    }

    if (architect && architect.trim() !== "") {
      whereClause.architect = {
        contains: architect,
      };
    }
    if (position && distance) {
      const allData = await prisma.colonizationData.findMany({
        where: whereClause,
        orderBy: [{ timeLeft: "asc" }, { isPrimaryPort: "desc" }],
      });

      const filteredData = allData.filter((item) => {
        if (
          item.positionX === null ||
          item.positionX === undefined ||
          item.positionY === null ||
          item.positionY === undefined ||
          item.positionZ === null ||
          item.positionZ === undefined
        ) {
          return false;
        }

        const euclideanDistance = Math.sqrt(
          Math.pow(item.positionX - position.x, 2) +
            Math.pow(item.positionY - position.y, 2) +
            Math.pow(item.positionZ - position.z, 2),
        );

        return euclideanDistance <= distance;
      });

      return filteredData.slice(skip, skip + pageSize);
    }

    return await prisma.colonizationData.findMany({
      skip,
      take: pageSize,
      where: whereClause,
      orderBy: [{ timeLeft: "asc" }, { isPrimaryPort: "desc" }],
    });
  } catch (error) {
    console.error("Error fetching colonization data:", error);
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

export default prisma;
