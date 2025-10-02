-- CreateTable
CREATE TABLE "ColonizationData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectName" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "architect" TEXT NOT NULL,
    "starPortType" TEXT NOT NULL,
    "isPrimaryPort" BOOLEAN NOT NULL,
    "srv_survey_link" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "addedBy" TEXT NOT NULL,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "SystemBodies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bodyName" TEXT NOT NULL,
    "distLs" REAL NOT NULL,
    "bodyType" TEXT NOT NULL,
    "colonizationDataId" INTEGER NOT NULL,
    CONSTRAINT "SystemBodies_colonizationDataId_fkey" FOREIGN KEY ("colonizationDataId") REFERENCES "ColonizationData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyFeatures" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "featureName" TEXT NOT NULL,
    "systemBodyId" INTEGER NOT NULL,
    CONSTRAINT "BodyFeatures_systemBodyId_fkey" FOREIGN KEY ("systemBodyId") REFERENCES "SystemBodies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ColonizationData_systemName_architect_key" ON "ColonizationData"("systemName", "architect");
