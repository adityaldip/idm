-- BAGIAN 1 dari 2 — untuk phpPgAdmin: SQL > "SQL script file to upload" > Execute
--
-- Aman: hanya menambah struktur baru dan menyalin status lama ke kolom baru.
-- Kolom "status" lama masih utuh setelah file ini, jadi situs versi lama tetap
-- berjalan normal dan langkah ini masih bisa dibatalkan begitu saja.
--
-- Setelah ini, jalankan query pemeriksaan (lihat catatan) sebelum BAGIAN 2.
-- Tidak memakai BEGIN/COMMIT maupun blok $$ karena parser phpPgAdmin memecah
-- skrip di setiap titik koma.

ALTER TABLE "shipments" ADD COLUMN "poNumber" TEXT;

CREATE TYPE "ItemUnit" AS ENUM ('PCS','BATANG','ROLL','HASPEL','METER','KG','TON','M3','KOLI','PALLET','SET','UNIT','DRUM');

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

CREATE INDEX "shipment_items_shipmentId_sortOrder_idx" ON "shipment_items"("shipmentId","sortOrder");

ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

INSERT INTO "shipment_status_defs" ("id","code","label","color","sortOrder","isInitial","isFinal","allowFromAny","isActive","createdAt","updatedAt") VALUES ('sts_created','CREATED','Created','slate',0,true,false,false,true,NOW(),NOW()), ('sts_picked_up','PICKED_UP','Picked Up','blue',1,false,false,false,true,NOW(),NOW()), ('sts_in_warehouse','IN_WAREHOUSE','In Warehouse','indigo',2,false,false,false,true,NOW(),NOW()), ('sts_in_transit','IN_TRANSIT','In Transit','amber',3,false,false,false,true,NOW(),NOW()), ('sts_out_for_delivery','OUT_FOR_DELIVERY','Out for Delivery','orange',4,false,false,false,true,NOW(),NOW()), ('sts_delivered','DELIVERED','Delivered','emerald',5,false,true,false,true,NOW(),NOW()), ('sts_returned','RETURNED','Returned','red',6,false,true,true,true,NOW(),NOW());

ALTER TABLE "shipments" ADD COLUMN "statusId" TEXT;

ALTER TABLE "tracking_histories" ADD COLUMN "statusId" TEXT;

UPDATE "shipments" s SET "statusId" = d."id" FROM "shipment_status_defs" d WHERE d."code" = s."status"::text;

UPDATE "tracking_histories" t SET "statusId" = d."id" FROM "shipment_status_defs" d WHERE d."code" = t."status"::text;
