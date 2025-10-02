/*
  Warnings:

  - You are about to alter the column `timeLeft` on the `ColonizationData` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- CreateTable
CREATE TABLE "SystemInfoCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "systemName" TEXT NOT NULL,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    "positionZ" REAL NOT NULL,
    "coordsLocked" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ColonizationData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectName" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "timeLeft" INTEGER,
    "positionX" REAL,
    "positionY" REAL,
    "positionZ" REAL,
    "architect" TEXT NOT NULL,
    "progress" INTEGER,
    "starPortType" TEXT NOT NULL,
    "isPrimaryPort" BOOLEAN NOT NULL,
    "srv_survey_link" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "addedBy" TEXT NOT NULL,
    "notes" TEXT
);
INSERT INTO "new_ColonizationData" ("addedBy", "architect", "createdAt", "id", "isCompleted", "isPrimaryPort", "notes", "positionX", "positionY", "positionZ", "progress", "projectName", "srv_survey_link", "starPortType", "systemName", "timeLeft", "updatedAt") SELECT "addedBy", "architect", "createdAt", "id", "isCompleted", "isPrimaryPort", "notes", "positionX", "positionY", "positionZ", "progress", "projectName", "srv_survey_link", "starPortType", "systemName", "timeLeft", "updatedAt" FROM "ColonizationData";
DROP TABLE "ColonizationData";
ALTER TABLE "new_ColonizationData" RENAME TO "ColonizationData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SystemInfoCache_systemName_key" ON "SystemInfoCache"("systemName");
