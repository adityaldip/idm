-- BAGIAN 2 dari 2 — untuk phpPgAdmin: SQL > "SQL script file to upload" > Execute
--
-- JANGAN jalankan sebelum query pemeriksaan mengembalikan 0 dan 0:
--
--   SELECT (SELECT count(*) FROM "shipments" WHERE "statusId" IS NULL) AS shipment_belum_terisi,
--          (SELECT count(*) FROM "tracking_histories" WHERE "statusId" IS NULL) AS tracking_belum_terisi;
--
-- File ini membuang kolom status lama. Backup dulu.

ALTER TABLE "shipments" ALTER COLUMN "statusId" SET NOT NULL;

ALTER TABLE "tracking_histories" ALTER COLUMN "statusId" SET NOT NULL;

ALTER TABLE "shipments" ADD CONSTRAINT "shipments_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "shipment_status_defs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tracking_histories" ADD CONSTRAINT "tracking_histories_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "shipment_status_defs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX "shipments_status_idx";

CREATE INDEX "shipments_statusId_idx" ON "shipments"("statusId");

ALTER TABLE "shipments" DROP COLUMN "status";

ALTER TABLE "tracking_histories" DROP COLUMN "status";

DROP TYPE "ShipmentStatus";
