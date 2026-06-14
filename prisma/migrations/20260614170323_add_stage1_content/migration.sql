-- CreateTable
CREATE TABLE "Stage1Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "questions" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stage1Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT,
    CONSTRAINT "Stage1Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Stage1Activity_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Stage1Content" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Stage1Activity" ("createdAt", "feedback", "id", "score", "type", "userId", "xpAwarded") SELECT "createdAt", "feedback", "id", "score", "type", "userId", "xpAwarded" FROM "Stage1Activity";
DROP TABLE "Stage1Activity";
ALTER TABLE "new_Stage1Activity" RENAME TO "Stage1Activity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
