# Foto Marketing Situs

Foto yang dipakai di hero halaman dan kartu layanan. Path-nya dipetakan di
`src/lib/site-media.ts` — ganti file dengan nama yang sama untuk menukar foto,
tanpa ubah kode.

## Status: stock photo

Semua foto di folder ini **stock photo dari [Pexels](https://www.pexels.com/license/)**
(bebas dipakai komersial, tanpa atribusi) — bukan foto operasional IDM. Karena
itu tidak ada satu pun yang diberi keterangan "dokumentasi kami". Kalau nanti
ada foto asli dari lapangan, timpa file-nya dan keterangan boleh dipertegas.

| File | Ukuran | Sumber |
|------|--------|--------|
| `hero-about.jpg` | 1600x640 | https://www.pexels.com/photo/modern-warehouse-operations-with-employees-and-forklift-30824313/ |
| `hero-services.jpg` | 1600x640 | https://www.pexels.com/photo/panoramic-view-of-hamburg-container-terminal-29278107/ |
| `hero-contact.jpg` | 1600x640 | https://www.pexels.com/photo/semi-truck-on-scenic-highway-with-mountains-34902065/ |
| `hero-berita.jpg` | 1600x640 | https://www.pexels.com/photo/forklift-stacking-cardboard-in-industrial-warehouse-35665496/ |
| `about-warehouse.jpg` | 1000x750 | https://www.pexels.com/photo/workers-walking-along-aisle-in-warehouse-4487383/ |
| `service-domestic-distribution.jpg` | 900x506 | https://www.pexels.com/photo/man-packing-boxes-into-a-truck-6699418/ |
| `service-express.jpg` | 900x506 | https://www.pexels.com/photo/urban-motorcycle-courier-riding-through-city-street-37059837/ |
| `service-ocean-freight.jpg` | 900x506 | https://www.pexels.com/photo/sunset-over-bintulu-port-with-crane-and-cargo-ships-35458829/ |
| `service-standard.jpg` | 900x506 | https://www.pexels.com/photo/stacks-of-boxes-ready-for-delivery-4440800/ |
| `service-freight.jpg` | 900x506 | https://www.pexels.com/photo/forklift-in-warehouse-17229385/ |
| `service-project-cargo.jpg` | 900x506 | https://www.pexels.com/photo/cranes-over-a-container-ship-20581299/ |
| `service-air-freight.jpg` | 900x506 | https://www.pexels.com/photo/boxes-being-loaded-onto-an-airplane-9749472/ |

## Aturan kalau menambah / mengganti

- Hero: rasio 2.5:1 (1600x640). Sisakan ruang kosong di kiri untuk teks.
- Kartu layanan: rasio 16:9 (900x506).
- Kompres dulu — foto disajikan apa adanya (`unoptimized`), target di bawah
  ~250 KB per file.
- Hindari foto dengan merek, plat nomor, atau nomor telepon perusahaan lain
  yang terbaca.

Foto layanan dipetakan per slug offering (`domestic-distribution`, `express`,
`ocean-freight`, `standard`, `freight`, `project-cargo`, `air-freight`) dengan
fallback per ikon, jadi layanan baru tetap dapat foto yang masuk akal.
