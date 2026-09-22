-- Tracking photos on status updates.
-- Run ONCE against production BEFORE deploying the new build:
--
--   DBURL=$(grep -h '^DATABASE_URL' .env | cut -d= -f2- | tr -d '"' | sed 's/?.*//')
--   psql "$DBURL" -v ON_ERROR_STOP=1 -f scripts/migrations/2026-09-22-tracking-photos.sql
--
-- Safe to re-run: CREATE TABLE IF NOT EXISTS / indexes IF NOT EXISTS.

BEGIN;

CREATE TABLE IF NOT EXISTS "tracking_photos" (
    "id" TEXT NOT NULL,
    "trackingHistoryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_photos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tracking_photos_trackingHistoryId_sortOrder_idx"
  ON "tracking_photos"("trackingHistoryId", "sortOrder");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tracking_photos_trackingHistoryId_fkey'
  ) THEN
    ALTER TABLE "tracking_photos"
      ADD CONSTRAINT "tracking_photos_trackingHistoryId_fkey"
      FOREIGN KEY ("trackingHistoryId") REFERENCES "tracking_histories"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;
