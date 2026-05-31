-- CreateTable
CREATE TABLE "SceneVersion" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SceneVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SceneVersion_sceneId_idx" ON "SceneVersion"("sceneId");

-- AddForeignKey
ALTER TABLE "SceneVersion" ADD CONSTRAINT "SceneVersion_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: every scene that already produced a video gets a version 1 so the
-- new version switcher keeps showing the previously generated video.
INSERT INTO "SceneVersion" ("id", "sceneId", "videoUrl", "createdAt")
SELECT gen_random_uuid()::text, "id", "videoUrl", "updatedAt"
FROM "Scene"
WHERE "videoUrl" IS NOT NULL;
