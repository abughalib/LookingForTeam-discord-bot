/*
  Warnings:

  - You are about to drop the `BodyFeatures` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemBodies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isCompleted` to the `ColonizationData` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BodyFeatures";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SystemBodies";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ColonizationData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectName" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "timeLeft" BIGINT,
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
INSERT INTO "new_ColonizationData" ("addedBy", "architect", "createdAt", "id", "isPrimaryPort", "notes", "projectName", "srv_survey_link", "starPortType", "systemName", "updatedAt") SELECT "addedBy", "architect", "createdAt", "id", "isPrimaryPort", "notes", "projectName", "srv_survey_link", "starPortType", "systemName", "updatedAt" FROM "ColonizationData";
DROP TABLE "ColonizationData";
ALTER TABLE "new_ColonizationData" RENAME TO "ColonizationData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
