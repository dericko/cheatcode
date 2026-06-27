/*
  Warnings:

  - The primary key for the `ProblemProgress` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProblemProgress" (
    "slug" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'typescript',
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "bestTimeMs" INTEGER,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("slug", "language")
);
INSERT INTO "new_ProblemProgress" ("bestTimeMs", "slug", "solved", "updatedAt") SELECT "bestTimeMs", "slug", "solved", "updatedAt" FROM "ProblemProgress";
DROP TABLE "ProblemProgress";
ALTER TABLE "new_ProblemProgress" RENAME TO "ProblemProgress";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
