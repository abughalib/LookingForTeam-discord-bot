-- CreateTable
CREATE TABLE "SystemTrafficCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "systemName" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "cachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemTrafficCache_systemName_key" ON "SystemTrafficCache"("systemName");
