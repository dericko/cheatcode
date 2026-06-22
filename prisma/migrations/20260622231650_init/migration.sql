-- CreateTable
CREATE TABLE "Attempt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "timeSpentMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProblemProgress" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "bestTimeMs" INTEGER,
    "updatedAt" DATETIME NOT NULL
);
