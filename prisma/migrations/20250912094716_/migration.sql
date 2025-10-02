/*
  Warnings:

  - You are about to drop the `Participants` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectName]` on the table `ColonizationData` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Participants";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Participant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ParticipantOnProject" (
    "participantId" INTEGER NOT NULL,
    "colonizationDataId" INTEGER NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("participantId", "colonizationDataId"),
    CONSTRAINT "ParticipantOnProject_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ParticipantOnProject_colonizationDataId_fkey" FOREIGN KEY ("colonizationDataId") REFERENCES "ColonizationData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ColonizationData_projectName_key" ON "ColonizationData"("projectName");
