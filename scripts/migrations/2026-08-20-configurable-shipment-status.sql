-- Migration for the PO number, cargo line items, and configurable status release.
--
-- Run this ONCE against the production database BEFORE deploying the new build.
-- Do NOT use `prisma db push` for this release: Prisma drops shipments.status
-- and tracking_histories.status in the same statement that adds statusId, which
-- destroys every shipment's status.
--
-- The whole migration is one transaction and verifies its own backfill, so it
-- either completes or leaves the database exactly as it was.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f 2026-08-20-configurable-shipment-status.sql

BEGIN;

-- ---------------------------------------------------------------- PO number
ALTER TABLE "shipments" ADD COLUMN "poNumber" TEXT;

-- --------------------------------------------------------- cargo line items
CREATE TYPE "ItemUnit" AS ENUM ('PCS', 'BATANG', 'ROLL', 'HASPEL', 'METER', 'KG', 'TON', 'M3', 'KOLI', 'PALLET', 'SET', 'UNIT', 'DRUM');

CREATE TABLE "shipment_items" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" "ItemUnit" NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "volumeM3" DOUBLE PRECISION,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shipment_items_shipmentId_sortOrder_idx" ON "shipment_items"("shipmentId", "sortOrder");

ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipmentId_fkey"
  FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------- configurable statuses
CREATE TABLE "shipment_status_defs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'slate',
    "sortOrder" INTEGER NOT NULL,
    "isInitial" BOOLEAN NOT NULL DEFAULT false,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "allowFromAny" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipment_status_defs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipment_status_defs_code_key" ON "shipment_status_defs"("code");
CREATE INDEX "shipment_status_defs_sortOrder_idx" ON "shipment_status_defs"("sortOrder");

-- One row per value of the old enum, in the order the old workflow used.
INSERT INTO "shipment_status_defs"
  ("id", "code", "label", "color", "sortOrder", "isInitial", "isFinal", "allowFromAny", "isActive", "createdAt", "updatedAt")
VALUES
  ('sts_created',          'CREATED',          'Created',          'slate',   0, true,  false, false, true, NOW(), NOW()),
  ('sts_picked_up',        'PICKED_UP',        'Picked Up',        'blue',    1, false, false, false, true, NOW(), NOW()),
  ('sts_in_warehouse',     'IN_WAREHOUSE',     'In Warehouse',     'indigo',  2, false, false, false, true, NOW(), NOW()),
  ('sts_in_transit',       'IN_TRANSIT',       'In Transit',       'amber',   3, false, false, false, true, NOW(), NOW()),
  ('sts_out_for_delivery', 'OUT_FOR_DELIVERY', 'Out for Delivery', 'orange',  4, false, false, false, true, NOW(), NOW()),
  ('sts_delivered',        'DELIVERED',        'Delivered',        'emerald', 5, false, true,  false, true, NOW(), NOW()),
  ('sts_returned',         'RETURNED',         'Returned',         'red',     6, false, true,  true,  true, NOW(), NOW());

-- Nullable first so existing rows survive the add.
ALTER TABLE "shipments" ADD COLUMN "statusId" TEXT;
ALTER TABLE "tracking_histories" ADD COLUMN "statusId" TEXT;

UPDATE "shipments" s
   SET "statusId" = d."id"
  FROM "shipment_status_defs" d
 WHERE d."code" = s."status"::text;

UPDATE "tracking_histories" t
   SET "statusId" = d."id"
  FROM "shipment_status_defs" d
 WHERE d."code" = t."status"::text;

-- Refuse to drop the old columns unless every row was carried over.
DO $$
DECLARE missing INTEGER;
BEGIN
  SELECT count(*) INTO missing FROM "shipments" WHERE "statusId" IS NULL;
  IF missing > 0 THEN
    RAISE EXCEPTION 'Backfill incomplete: % shipments have no statusId', missing;
  END IF;

  SELECT count(*) INTO missing FROM "tracking_histories" WHERE "statusId" IS NULL;
  IF missing > 0 THEN
    RAISE EXCEPTION 'Backfill incomplete: % tracking rows have no statusId', missing;
  END IF;
END $$;

ALTER TABLE "shipments" ALTER COLUMN "statusId" SET NOT NULL;
ALTER TABLE "tracking_histories" ALTER COLUMN "statusId" SET NOT NULL;

ALTER TABLE "shipments" ADD CONSTRAINT "shipments_statusId_fkey"
  FOREIGN KEY ("statusId") REFERENCES "shipment_status_defs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tracking_histories" ADD CONSTRAINT "tracking_histories_statusId_fkey"
  FOREIGN KEY ("statusId") REFERENCES "shipment_status_defs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX "shipments_status_idx";
CREATE INDEX "shipments_statusId_idx" ON "shipments"("statusId");

ALTER TABLE "shipments" DROP COLUMN "status";
ALTER TABLE "tracking_histories" DROP COLUMN "status";
DROP TYPE "ShipmentStatus";

COMMIT;
