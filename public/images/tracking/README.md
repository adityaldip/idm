# Foto Proses Pengiriman & Pelacakan

Letakkan foto di folder ini. Foto akan otomatis muncul di section
"Dari Penjemputan Sampai Serah Terima" pada halaman utama — tanpa ubah kode.

## Status saat ini

Empat foto yang terpasang adalah **stock photo dari [Pexels](https://www.pexels.com/license/)**
(bebas dipakai komersial, tanpa atribusi) — bukan foto operasional IDM:

| File                  | Sumber |
|-----------------------|--------|
| `01-penjemputan.jpg`  | https://www.pexels.com/photo/men-loading-boxes-4487486/ |
| `02-gudang.jpg`       | https://www.pexels.com/photo/men-working-at-a-courier-service-6169653/ |
| `03-perjalanan.jpg`   | https://www.pexels.com/photo/trucks-on-scenic-mountain-highway-31550630/ |
| `04-serah-terima.jpg` | https://www.pexels.com/photo/a-person-signing-a-proof-of-delivery-8989470/ |

Karena itu judul section-nya ilustratif, bukan "Dokumentasi". Begitu ada foto
asli dari lapangan, timpa file-file ini — judul boleh diubah jadi dokumentasi.

## Aturan

- Format: `.jpg`, `.jpeg`, `.png`, `.webp`, atau `.avif`
- Rasio ideal 4:3 (mis. 1200x900). Foto dipotong otomatis (`object-cover`).
- Kompres dulu — foto disajikan apa adanya (`unoptimized`, sama seperti logo
  partner), jadi usahakan di bawah ~300 KB per file.
- Maksimal 6 foto ditampilkan, diurutkan berdasarkan nama file.
- Beri awalan angka untuk mengatur urutan, mis. `01-...`, `02-...`

## Nama file dengan keterangan siap pakai

| Nama file            | Judul            |
|----------------------|------------------|
| `01-penjemputan.jpg` | Penjemputan      |
| `02-gudang.jpg`      | Sortir di Gudang |
| `03-perjalanan.jpg`  | Dalam Perjalanan |
| `04-serah-terima.jpg`| Serah Terima     |

Nama file lain tetap tampil — judulnya dibuat dari nama file
(mis. `05-bongkar-muat.jpg` menjadi "Bongkar Muat"), hanya tanpa keterangan.

Keterangan diatur di `src/lib/tracking-media.ts`.
