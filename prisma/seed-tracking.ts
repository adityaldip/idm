/**
 * Tracking test data: one shipment per status, plus PO-number lookups
 * (a unique PO and a PO shared by two shipments). Run after the main seed:
 *
 *   pnpm db:seed:tracking
 *
 * Idempotent: shipments are upserted by tracking number and their tracking
 * history is rebuilt on every run, with timestamps relative to "now".
 * Uses low IDM2026xxxxxx numbers, so never run it against production data.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HOUR = 60 * 60 * 1000;
const hoursAgo = (h: number) => new Date(Date.now() - h * HOUR);

type Step = {
  status: string;
  location: string;
  description: string;
  branch: "SMG" | "BKS";
  hoursAgo: number;
};

type TestShipment = {
  trackingNumber: string;
  poNumber?: string;
  service: string;
  senderName: string;
  senderCity: string;
  recipientName: string;
  recipientCity: string;
  recipientAddress: string;
  weight: number;
  packageCount: number;
  description: string;
  cost: number;
  /** Days from now; negative values are in the past. */
  etaDays: number;
  history: Step[];
  delivered?: boolean;
};

// Shared opening steps for a Semarang → Bekasi road shipment.
const created = (h: number): Step => ({
  status: "CREATED",
  location: "Kantor Semarang",
  description: "Pesanan pengiriman dibuat",
  branch: "SMG",
  hoursAgo: h,
});
const pickedUp = (h: number): Step => ({
  status: "PICKED_UP",
  location: "Tembalang, Semarang",
  description: "Paket dijemput dari pengirim",
  branch: "SMG",
  hoursAgo: h,
});
const inWarehouse = (h: number): Step => ({
  status: "IN_WAREHOUSE",
  location: "Gudang Hub Semarang",
  description: "Paket tiba di gudang asal dan sedang disortir",
  branch: "SMG",
  hoursAgo: h,
});
const inTransit = (h: number): Step => ({
  status: "IN_TRANSIT",
  location: "Tol Trans Jawa, Cirebon",
  description: "Paket dalam perjalanan ke kota tujuan",
  branch: "SMG",
  hoursAgo: h,
});
const outForDelivery = (h: number): Step => ({
  status: "OUT_FOR_DELIVERY",
  location: "Bekasi Transit Hub",
  description: "Paket dibawa kurir menuju alamat penerima",
  branch: "BKS",
  hoursAgo: h,
});

const SHIPMENTS: TestShipment[] = [
  {
    trackingNumber: "IDM2026000002",
    service: "domestic-distribution",
    senderName: "CV Sumber Rejeki",
    senderCity: "Semarang",
    recipientName: "Dewi Lestari",
    recipientCity: "Bekasi",
    recipientAddress: "Jl. Ahmad Yani No. 12",
    weight: 1.2,
    packageCount: 1,
    description: "Dokumen kontrak",
    cost: 25000,
    etaDays: 3,
    history: [created(1)],
  },
  {
    trackingNumber: "IDM2026000003",
    service: "domestic-distribution",
    senderName: "Toko Batik Laras",
    senderCity: "Semarang",
    recipientName: "Hendra Gunawan",
    recipientCity: "Bekasi",
    recipientAddress: "Perum Harapan Indah Blok C/7",
    weight: 4,
    packageCount: 2,
    description: "Kain batik",
    cost: 60000,
    etaDays: 2,
    history: [created(8), pickedUp(5)],
  },
  {
    trackingNumber: "IDM2026000004",
    poNumber: "PO-2026-0451",
    service: "ocean-freight",
    senderName: "PT Mebel Jepara Jaya",
    senderCity: "Semarang",
    recipientName: "PT Interior Nusantara",
    recipientCity: "Bekasi",
    recipientAddress: "Kawasan Industri MM2100 Blok J-3",
    weight: 320,
    packageCount: 6,
    description: "Furnitur kayu jati",
    cost: 2750000,
    etaDays: 4,
    history: [created(30), pickedUp(26), inWarehouse(20)],
  },
  {
    trackingNumber: "IDM2026000005",
    poNumber: "PO-2026-0500",
    service: "project-cargo",
    senderName: "PT Baja Perkasa",
    senderCity: "Semarang",
    recipientName: "PT Konstruksi Mandiri",
    recipientCity: "Bekasi",
    recipientAddress: "Jl. Raya Narogong Km 12",
    weight: 1800,
    packageCount: 12,
    description: "Rangka baja proyek gudang (batch 1)",
    cost: 9800000,
    etaDays: 0,
    history: [
      created(52),
      pickedUp(48),
      inWarehouse(40),
      inTransit(20),
      outForDelivery(2),
    ],
  },
  {
    trackingNumber: "IDM2026000006",
    poNumber: "PO-2026-0500",
    service: "project-cargo",
    senderName: "PT Baja Perkasa",
    senderCity: "Semarang",
    recipientName: "PT Konstruksi Mandiri",
    recipientCity: "Bekasi",
    recipientAddress: "Jl. Raya Narogong Km 12",
    weight: 1650,
    packageCount: 10,
    description: "Rangka baja proyek gudang (batch 2)",
    cost: 9100000,
    etaDays: 2,
    history: [created(26), pickedUp(22), inWarehouse(15)],
  },
  {
    trackingNumber: "IDM2026000007",
    service: "air-freight",
    senderName: "PT Farmasi Sehat",
    senderCity: "Semarang",
    recipientName: "Apotek Medika",
    recipientCity: "Bekasi",
    recipientAddress: "Jl. Cut Meutia No. 88",
    weight: 15,
    packageCount: 3,
    description: "Obat-obatan (rantai dingin)",
    cost: 540000,
    etaDays: -1,
    delivered: true,
    history: [
      created(70),
      pickedUp(66),
      inWarehouse(60),
      inTransit(40),
      outForDelivery(28),
      {
        status: "DELIVERED",
        location: "Jl. Cut Meutia No. 88, Bekasi",
        description: "Paket diterima oleh Bapak Rudi (staf apotek)",
        branch: "BKS",
        hoursAgo: 25,
      },
    ],
  },
  {
    trackingNumber: "IDM2026000008",
    service: "domestic-distribution",
    senderName: "Toko Elektronik Prima",
    senderCity: "Semarang",
    recipientName: "Yusuf Pratama",
    recipientCity: "Bekasi",
    recipientAddress: "Jl. Kemakmuran Gg. Melati No. 3",
    weight: 6.5,
    packageCount: 1,
    description: "Monitor komputer",
    cost: 85000,
    etaDays: -2,
    history: [
      created(120),
      pickedUp(116),
      inWarehouse(110),
      inTransit(90),
      outForDelivery(72),
      {
        status: "OUT_FOR_DELIVERY",
        location: "Bekasi Transit Hub",
        description: "Pengantaran ulang: penerima tidak di tempat pada percobaan pertama",
        branch: "BKS",
        hoursAgo: 48,
      },
      {
        status: "RETURNED",
        location: "Kantor Semarang",
        description: "Paket dikembalikan ke pengirim setelah 2 kali gagal antar",
        branch: "SMG",
        hoursAgo: 6,
      },
    ],
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed tracking test data in production.");
  }

  console.log("🚚 Seeding tracking test shipments...");

  const [smg, bks, customer, admin, statuses, services] = await Promise.all([
    prisma.branch.findUnique({ where: { code: "BR-SMG-01" } }),
    prisma.branch.findUnique({ where: { code: "BR-BKS-01" } }),
    prisma.customer.findUnique({ where: { code: "CUS-00001" } }),
    prisma.user.findUnique({ where: { email: "admin@ptintandayamandiri.co.id" } }),
    prisma.shipmentStatusDef.findMany(),
    prisma.serviceOffering.findMany(),
  ]);
  if (!smg || !bks || !customer || !admin) {
    throw new Error("Run the main seed first (pnpm db:seed).");
  }

  const branchId = { SMG: smg.id, BKS: bks.id };
  const statusId = (code: string) => {
    const def = statuses.find((s) => s.code === code);
    if (!def) throw new Error(`Missing shipment status ${code}`);
    return def.id;
  };
  const serviceId = (slug: string) => {
    const offering = services.find((s) => s.slug === slug);
    if (!offering) throw new Error(`Missing service offering ${slug}`);
    return offering.id;
  };

  for (const s of SHIPMENTS) {
    const last = s.history[s.history.length - 1];
    const data = {
      poNumber: s.poNumber ?? null,
      statusId: statusId(last.status),
      serviceOfferingId: serviceId(s.service),
      customerId: customer.id,
      senderName: s.senderName,
      senderPhone: "+62 24 7673 7893",
      senderAddress: "Kawasan Industri Candi Blok A-1",
      senderCity: s.senderCity,
      recipientName: s.recipientName,
      recipientPhone: "+62 812 0000 0000",
      recipientAddress: s.recipientAddress,
      recipientCity: s.recipientCity,
      originBranchId: smg.id,
      destinationBranchId: bks.id,
      weight: s.weight,
      packageCount: s.packageCount,
      description: s.description,
      shippingCost: s.cost,
      totalCost: s.cost,
      currentLocation: last.location,
      estimatedDelivery: new Date(Date.now() + s.etaDays * 24 * HOUR),
      actualDelivery: s.delivered ? hoursAgo(last.hoursAgo) : null,
      createdAt: hoursAgo(s.history[0].hoursAgo),
    };

    const shipment = await prisma.shipment.upsert({
      where: { trackingNumber: s.trackingNumber },
      update: data,
      create: { trackingNumber: s.trackingNumber, createdById: admin.id, ...data },
    });

    await prisma.$transaction([
      prisma.trackingHistory.deleteMany({ where: { shipmentId: shipment.id } }),
      prisma.trackingHistory.createMany({
        data: s.history.map((step) => ({
          shipmentId: shipment.id,
          statusId: statusId(step.status),
          location: step.location,
          description: step.description,
          branchId: branchId[step.branch],
          updatedById: admin.id,
          timestamp: hoursAgo(step.hoursAgo),
        })),
      }),
    ]);

    console.log(
      `   ${s.trackingNumber}  ${last.status.padEnd(16)} ${s.poNumber ?? ""}`,
    );
  }

  console.log("✅ Tracking test data ready.");
  console.log("   Try PO lookup: PO-2026-0451 (1 match), PO-2026-0500 (2 matches)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
