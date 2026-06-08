/** Brand colors from idmnew Porto theme */
export const BRAND_COLORS = {
  primary: "#0F4C81",
  gold: "#c78a2d",
  goldDark: "#63400a",
} as const;

export const COMPANY = {
  name: "PT Intan Daya Mandiri",
  legalName: "PT. INTAN DAYA MANDIRI",
  tagline: "Your Business Partner",
  taglineId: "Mitra Bisnis Anda",
  foundedDate: "14 Februari 2013",
  foundedYear: 2013,
  rebrandYear: 2021,
  website: "https://ptintandayamandiri.co.id",
  email: "info@ptintandayamandiri.co.id",
  phone: "(024) 7673 7893",
  phoneHref: "+622476737893",
  phoneBekasi: "(021) 89528543",
  phoneBekasiHref: "+622189528543",
  hours: "Senin – Jumat, 09:00 – 17:30 WIB",
  address: {
    street: "Mutiara Gading Blok E No. 5, Jl. Ketileng, Klipang",
    district: "Tembalang",
    city: "Kota Semarang",
    province: "Jawa Tengah",
    postalCode: "50272",
    full: "Mutiara Gading Blok E No. 5, Jl. Ketileng, Klipang, Tembalang, Kota Semarang, Jawa Tengah 50272",
  },
  addressBekasi: {
    street: "Ruko Tambun City RG.08, Jln. Sultan Hasanudin",
    district: "Tambun Selatan",
    city: "Bekasi",
    province: "Jawa Barat",
    full: "Ruko Tambun City RG.08, Jln. Sultan Hasanudin, Tambun Selatan, Bekasi, Jawa Barat",
  },
} as const;

export const COMPANY_PROFILE = {
  short:
    "PT Intan Daya Mandiri adalah perusahaan yang bergerak di bidang jasa pengiriman barang. Kami menyediakan berbagai layanan yang murah, cepat, aman, dan terpercaya.",
  history:
    "Pada 14 Februari 2013, PT. Intan Daya Mandiri memulai bisnis di transportasi dan pengiriman barang antar pulau. Berawal dari PT. Telkom Indonesia yang menjadi pelanggan pertama kami. Melihat bisnis yang semakin beragam kebutuhannya, pada awal tahun 2021 PT Intan Daya Mandiri melakukan perubahan internal — mengubah logo perusahaan dan visi misi untuk menghadapi tantangan global.",
  about:
    "Alasan berdirinya PT. Intan Daya Mandiri karena melihat pesatnya perkembangan dan pertumbuhan ekonomi di Indonesia, khususnya dalam bidang penyediaan jasa transportasi pengiriman barang. Dengan keikhlasan, kejelian, dan tekad kuat, perusahaan ini tumbuh dan berkembang secara positif dari tahun ke tahun — baik dari segi penerimaan maupun kualitas pelayanan.",
  whyUs:
    "Manajemen kami selalu berpikir dan menempatkan fleksibilitas di depan bisnis kami. Kami sangat menghargai komitmen yang terjadi antara kami dan pelanggan. Oleh karena itu kami akan menjaga waktu, kualitas, dan kerahasiaan yang terkait dengan pelanggan kami.",
} as const;

export const VISION_MISSION = {
  vision:
    "Menjadi mitra bisnis terpercaya yang mengutamakan integritas dan layanan pengiriman yang handal.",
  mission:
    "Memberikan nilai tambah untuk pelanggan, pemilik perusahaan, dan karyawan. Memberikan harga paling kompetitif kepada pelanggan serta bantuan pengiriman barang lengkap dengan cepat dan tepat waktu.",
} as const;

export const COMPANY_STATS = [
  { label: "Klien", value: "54+", icon: "users" },
  { label: "Tahun Berbisnis", value: `${new Date().getFullYear() - 2013}+`, icon: "calendar" },
  { label: "Pengiriman", value: "420+", icon: "truck" },
  { label: "Jangkauan Se-Indonesia", value: "30+", icon: "map" },
] as const;

export const WHY_CHOOSE_US = [
  "Pengiriman cepat, aman & terpercaya",
  "Tarif ekspedisi kompetitif",
  "Customer support 24/7",
  "Real-time tracking",
  "Aman & terpercaya — pelayanan maksimal",
] as const;

export const OFFERINGS = [
  "Transportasi (Trip Base, Fix Variable, Rental Unit, dan lainnya)",
  "Manajemen Barang (Ekspor, Impor, Antar Pulau)",
  "Pialang Kustom",
  "Layanan Gudang",
  "Proyek Kargo Khusus (Lebih Berat, Lebih Dimensi)",
  "Perjalanan Kapal, Perjalanan Kapal Tug",
] as const;

export const SERVICES = [
  {
    slug: "ocean-freight",
    name: "Pengiriman Jalur Laut",
    nameEn: "Ocean Freight",
    icon: "Ship",
    description:
      "Jasa ekspedisi dan pengiriman barang murah melalui laut dengan harga kompetitif, aman, dan terpercaya.",
    features: [
      "Jangkauan seluruh Indonesia",
      "Cepat, aman & tepat waktu",
      "Tarif kompetitif",
    ],
  },
  {
    slug: "domestic-distribution",
    name: "Distribusi Domestik",
    nameEn: "Domestic Distribution",
    icon: "Truck",
    description:
      "Layanan pengiriman lokal cepat dengan rute pengiriman luas menjangkau seluruh Indonesia.",
    features: [
      "40+ kota di Indonesia",
      "Terintegrasi & andal",
      "Kualitas layanan terbaik",
    ],
  },
  {
    slug: "project-cargo",
    name: "Project Cargo",
    nameEn: "Project Cargo",
    icon: "Container",
    description:
      "Jasa pengiriman dalam jumlah besar melalui cargo darat, laut, dan udara.",
    features: [
      "Invoice berjalan",
      "Pembayaran dengan DP",
      "Pembayaran akhir",
    ],
  },
  {
    slug: "air-freight",
    name: "Pengiriman Jalur Udara",
    nameEn: "Air Freight",
    icon: "Plane",
    description:
      "Jasa pengiriman barang dan ekspedisi melalui udara yang lebih cepat dan efisien.",
    features: [
      "Pengiriman express",
      "Lebih cepat & efisien",
      "Jangkauan nasional",
    ],
  },
] as const;

export const COVERAGE_REGIONS = [
  "Kalimantan",
  "Bangka Belitung",
  "Sulawesi",
  "Kepulauan Riau",
  "Kupang",
  "Lombok",
  "Maluku",
  "Papua",
] as const;

export const PARTNERS = [
  { name: "KIA", logo: "/images/partners/kia.jpg" },
  { name: "Telkom", logo: "/images/partners/telkom.jpg" },
  { name: "Pemerintah Jawa Tengah", logo: "/images/partners/jateng.jpg" },
  { name: "Garuda", logo: "/images/partners/garuda.jpg" },
] as const;

export const BRANCHES = [
  {
    name: "Kantor Semarang",
    address: COMPANY.address.full,
    phone: COMPANY.phone,
    isHeadquarters: true,
  },
  {
    name: "Kantor Bekasi",
    address: COMPANY.addressBekasi.full,
    phone: COMPANY.phoneBekasi,
    isHeadquarters: false,
  },
] as const;
