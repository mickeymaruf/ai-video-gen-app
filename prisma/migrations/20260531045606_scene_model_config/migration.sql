-- AlterTable
ALTER TABLE "Scene" ADD COLUMN     "endImageUrl" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English (US)',
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'fal-ai/minimax-video/image-to-video',
ADD COLUMN     "sound" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startImageUrl" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'UGC';
