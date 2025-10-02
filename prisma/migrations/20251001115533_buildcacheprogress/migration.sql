-- CreateTable
CREATE TABLE "RavenColonialCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buildId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "cachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RavenColonialCache_buildId_key" ON "RavenColonialCache"("buildId");
