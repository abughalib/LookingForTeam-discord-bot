-- CreateTable
CREATE TABLE "Participants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "colonizationDataId" INTEGER NOT NULL,
    CONSTRAINT "Participants_colonizationDataId_fkey" FOREIGN KEY ("colonizationDataId") REFERENCES "ColonizationData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
