import { PrismaClient, Role, ShipmentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding IDM database...");

  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const hqBranch = await prisma.branch.upsert({
    where: { code: "BR-SMG-01" },
    update: {
      name: "Kantor Semarang",
      address: "Mutiara Gading Blok E No. 5, Jl. Ketileng, Klipang",
      city: "Kota Semarang",
      province: "Jawa Tengah",
      postalCode: "50272",
      phone: "(024) 7673 7893",
      email: "info@ptintandayamandiri.co.id",
      isHeadquarters: true,
    },
    create: {
      code: "BR-SMG-01",
      name: "Kantor Semarang",
      address: "Mutiara Gading Blok E No. 5, Jl. Ketileng, Klipang",
      city: "Kota Semarang",
      province: "Jawa Tengah",
      postalCode: "50272",
      phone: "(024) 7673 7893",
      email: "info@ptintandayamandiri.co.id",
      latitude: -7.0051,
      longitude: 110.4381,
      isHeadquarters: true,
    },
  });

  const bekasiBranch = await prisma.branch.upsert({
    where: { code: "BR-BKS-01" },
    update: {},
    create: {
      code: "BR-BKS-01",
      name: "Kantor Bekasi",
      address: "Ruko Tambun City RG.08, Jln. Sultan Hasanudin",
      city: "Bekasi",
      province: "Jawa Barat",
      phone: "(021) 89528543",
      email: "info@ptintandayamandiri.co.id",
      latitude: -6.2349,
      longitude: 107.0981,
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@ptintandayamandiri.co.id" },
    update: {},
    create: {
      email: "admin@ptintandayamandiri.co.id",
      passwordHash,
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      branchId: hqBranch.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "operator@ptintandayamandiri.co.id" },
    update: {},
    create: {
      email: "operator@ptintandayamandiri.co.id",
      passwordHash: await bcrypt.hash("Operator123!", 12),
      name: "Warehouse Operator",
      role: Role.OPERATOR,
      branchId: hqBranch.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@ptintandayamandiri.co.id" },
    update: {},
    create: {
      email: "manager@ptintandayamandiri.co.id",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      name: "Operations Manager",
      role: Role.ADMIN,
      branchId: hqBranch.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "cs@ptintandayamandiri.co.id" },
    update: {},
    create: {
      email: "cs@ptintandayamandiri.co.id",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      name: "Customer Service",
      role: Role.CUSTOMER_SERVICE,
      branchId: bekasiBranch.id,
    },
  });

  const settings = [
    { key: "company_name", value: "PT Intan Daya Mandiri", group: "branding" },
    { key: "company_tagline", value: "Your Business Partner", group: "branding" },
    { key: "company_phone", value: "(024) 7673 7893", group: "general" },
    { key: "company_email", value: "info@ptintandayamandiri.co.id", group: "general" },
    { key: "company_address", value: "Mutiara Gading Blok E No. 5, Jl. Ketileng, Klipang, Tembalang, Kota Semarang, Jawa Tengah 50272", group: "general" },
    { key: "company_founded", value: "2013", group: "branding" },
    { key: "tracking_seq_2026", value: "2", group: "tracking" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  const contentBlocks = [
    {
      type: "HERO" as const,
      title: "PT. INTAN DAYA MANDIRI",
      subtitle: "Your Business Partner",
      body: "Perusahaan jasa pengiriman barang yang murah, cepat, aman, dan terpercaya.",
      metadata: { ctaPrimary: "Track Shipment", ctaSecondary: "Our Services" },
    },
    {
      type: "ABOUT" as const,
      title: "Tentang PT Intan Daya Mandiri",
      subtitle: "Berdiri sejak 14 Februari 2013",
      body: "Memulai bisnis transportasi antar pulau. Pelanggan pertama: PT. Telkom Indonesia. Rebranding 2021.",
    },
    {
      type: "CTA" as const,
      title: "100% Aman dan Terpercaya",
      subtitle: "Percayakan pengiriman ekspedisi Anda kepada kami.",
      body: null,
    },
    {
      type: "SERVICES_INTRO" as const,
      title: "Apa Yang Kami Tawarkan",
      subtitle: "Nilai tambah untuk bisnis Anda dengan layanan pengiriman yang handal.",
      body: null,
      metadata: {
        items: [
          "Transportasi (Trip Base, Fix Variable, Rental Unit)",
          "Manajemen Barang (Ekspor, Impor, Antar Pulau)",
          "Pialang Kustom",
          "Layanan Gudang",
          "Proyek Kargo Khusus",
          "Perjalanan Kapal & Kapal Tug",
        ],
      },
    },
    {
      type: "COVERAGE" as const,
      title: "Jangkauan Se-Indonesia",
      subtitle: null,
      body: "Beroperasi di lebih dari 40 kota di seluruh Indonesia dengan layanan terintegrasi dan kualitas terbaik.",
    },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { type: block.type },
      update: {
        title: block.title,
        subtitle: block.subtitle,
        body: block.body,
        metadata: block.metadata,
      },
      create: block,
    });
  }

  const services = [
    {
      slug: "domestic-distribution",
      name: "Domestic Distribution",
      description: "Jasa pengiriman barang lokal yang cepat dengan rute pengiriman luas ke seluruh Indonesia.",
      icon: "Truck",
      sortOrder: 1,
      features: ["40+ kota di Indonesia", "Tarif terjangkau", "Aman & bergaransi"],
    },
    {
      slug: "ocean-freight",
      name: "Ocean Freight",
      description: "Jasa pengiriman melalui jalur laut dengan harga kompetitif, aman, dan terpercaya.",
      icon: "Ship",
      sortOrder: 2,
      features: ["Jangkauan nasional", "Cepat & tepat waktu", "Tarif kompetitif"],
    },
    {
      slug: "project-cargo",
      name: "Project Cargo",
      description: "Pengiriman barang dalam jumlah besar melalui cargo darat, laut, dan udara.",
      icon: "Container",
      sortOrder: 3,
      features: ["Invoice berjalan", "Pembayaran DP", "Pembayaran akhir"],
    },
    {
      slug: "air-freight",
      name: "Air Freight",
      description: "Pengiriman melalui jalur udara yang lebih cepat dan efisien.",
      icon: "Plane",
      sortOrder: 4,
      features: ["Pengiriman express", "Efisien & cepat", "Jangkauan nasional"],
    },
  ];

  for (const service of services) {
    await prisma.serviceOffering.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  await prisma.coverageArea.upsert({
    where: { province: "Jawa Tengah" },
    update: {},
    create: {
      province: "Jawa Tengah",
      cities: ["Semarang", "Solo", "Magelang", "Kudus"],
    },
  });

  await prisma.coverageArea.upsert({
    where: { province: "Jawa Timur" },
    update: {},
    create: {
      province: "Jawa Timur",
      cities: ["Surabaya", "Malang", "Sidoarjo", "Gresik"],
    },
  });

  const partners = [
    { name: "Telkom", logoUrl: "/images/partners/telkom.jpg", sortOrder: 1 },
    { name: "Garuda", logoUrl: "/images/partners/garuda.jpg", sortOrder: 2 },
    { name: "Pemerintah Jawa Tengah", logoUrl: "/images/partners/jateng.jpg", sortOrder: 3 },
    { name: "KIA", logoUrl: "/images/partners/kia.jpg", sortOrder: 4 },
  ];

  for (const partner of partners) {
    const existing = await prisma.partner.findFirst({ where: { name: partner.name } });
    if (!existing) {
      await prisma.partner.create({ data: partner });
    }
  }

  const testimonials = [
    {
      name: "Budi Santoso",
      company: "PT Maju Bersama",
      role: "Operations Manager",
      content: "IDM has transformed our supply chain. Their tracking system and on-time delivery rate are exceptional.",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: "Siti Rahayu",
      company: "CV Elektronik Nusantara",
      role: "CEO",
      content: "Reliable, professional, and always responsive. We trust IDM for all our nationwide shipments.",
      rating: 5,
      sortOrder: 2,
    },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: testimonial.name },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
    }
  }

  const customer = await prisma.customer.upsert({
    where: { code: "CUS-00001" },
    update: {},
    create: {
      code: "CUS-00001",
      name: "Andi Wijaya",
      email: "andi@example.com",
      phone: "+62 812 3456 7890",
      company: "Toko Online Andi",
      city: "Jakarta",
      province: "DKI Jakarta",
    },
  });

  const defaultOffering = await prisma.serviceOffering.findFirst({
    orderBy: { sortOrder: "asc" },
  });

  if (!defaultOffering) {
    throw new Error("Seed requires at least one service offering");
  }

  const demoVehicle = await prisma.vehicle.upsert({
    where: { plateNumber: "B 1234 IDM" },
    update: {},
    create: {
      plateNumber: "B 1234 IDM",
      type: "VAN",
      brand: "Toyota",
      model: "Hiace",
      status: "IN_USE",
      branchId: hqBranch.id,
    },
  });

  const demoDriver = await prisma.driver.upsert({
    where: { code: "DRV-001" },
    update: {},
    create: {
      code: "DRV-001",
      name: "Bambang Santoso",
      phone: "+62 812 1111 2222",
      licenseNumber: "SIM-A-123456",
      status: "ACTIVE",
      vehicleId: demoVehicle.id,
    },
  });

  await prisma.news.upsert({
    where: { slug: "idm-perluas-jangkauan-2026" },
    update: {},
    create: {
      slug: "idm-perluas-jangkauan-2026",
      title: "IDM Perluas Jangkauan Pengiriman ke 40+ Kota",
      excerpt:
        "PT Intan Daya Mandiri memperluas jaringan distribusi domestik untuk melayani lebih banyak wilayah di Indonesia.",
      content:
        "PT Intan Daya Mandiri terus berkomitmen meningkatkan layanan logistik nasional.\n\nDengan investasi armada dan hub baru, kami kini menjangkau lebih dari 40 kota di seluruh Indonesia dengan standar pengiriman yang sama: cepat, aman, dan terpercaya.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: superAdmin.id,
    },
  });

  const shipment = await prisma.shipment.upsert({
    where: { trackingNumber: "IDM2026000001" },
    update: {},
    create: {
      trackingNumber: "IDM2026000001",
      status: ShipmentStatus.IN_TRANSIT,
      serviceOfferingId: defaultOffering.id,
      customerId: customer.id,
      senderName: "Andi Wijaya",
      senderPhone: "+62 812 3456 7890",
      senderAddress: "Jl. Sudirman No. 10",
      senderCity: "Semarang",
      recipientName: "Rina Kusuma",
      recipientPhone: "+62 813 9876 5432",
      recipientAddress: "Jl. Pemuda No. 25",
      recipientCity: "Bekasi",
      originBranchId: hqBranch.id,
      destinationBranchId: bekasiBranch.id,
      weight: 2.5,
      packageCount: 1,
      description: "Electronics package",
      shippingCost: 45000,
      totalCost: 45000,
      currentLocation: "Bekasi Transit Hub",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      vehicleId: demoVehicle.id,
      driverId: demoDriver.id,
      createdById: superAdmin.id,
    },
  });

  const trackingEvents = [
    {
      status: ShipmentStatus.CREATED,
      location: "Kantor Pusat Semarang",
      description: "Shipment created",
      branchId: hqBranch.id,
      daysAgo: 3,
    },
    {
      status: ShipmentStatus.PICKED_UP,
      location: "Tembalang, Semarang",
      description: "Package picked up from sender",
      branchId: hqBranch.id,
      daysAgo: 2,
    },
    {
      status: ShipmentStatus.IN_WAREHOUSE,
      location: "Hub Warehouse Semarang",
      description: "Arrived at origin warehouse",
      branchId: hqBranch.id,
      daysAgo: 2,
    },
    {
      status: ShipmentStatus.IN_TRANSIT,
      location: "Bekasi Transit Hub",
      description: "In transit to destination",
      branchId: bekasiBranch.id,
      daysAgo: 1,
    },
  ];

  for (const event of trackingEvents) {
    const existing = await prisma.trackingHistory.findFirst({
      where: {
        shipmentId: shipment.id,
        status: event.status,
      },
    });
    if (!existing) {
      await prisma.trackingHistory.create({
        data: {
          shipmentId: shipment.id,
          status: event.status,
          location: event.location,
          description: event.description,
          branchId: event.branchId,
          updatedById: superAdmin.id,
          timestamp: new Date(Date.now() - event.daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("✅ Seed completed!");
  console.log("   Super Admin: admin@ptintandayamandiri.co.id / Admin123!");
  console.log("   Admin:       manager@ptintandayamandiri.co.id / Admin123!");
  console.log("   Operator:    operator@ptintandayamandiri.co.id / Operator123!");
  console.log("   CS:          cs@ptintandayamandiri.co.id / Admin123!");
  console.log("   Demo tracking: IDM2026000001");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
