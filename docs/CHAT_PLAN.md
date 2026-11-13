# Plan: Live Chat (polling)

Pengunjung website chat dengan CS lewat widget di situs publik; CS membalas dari
halaman `/chat` di dashboard. Pesan baru diambil dengan polling (tanpa WebSocket,
tanpa layanan pihak ketiga) karena hosting cPanel/LiteSpeed tidak mendukung
WebSocket dengan andal. Semua data di PostgreSQL yang sama.

## 1. Polling

| Siapa | Kondisi | Interval |
|---|---|---|
| Pengunjung | Widget terbuka | 4 detik |
| Pengunjung | Widget tertutup / tab tidak aktif | 30 detik (cek unread saja) |
| CS | Membuka satu percakapan | 3 detik |
| CS | Daftar percakapan + badge sidebar | 10 detik |

- Request hanya mengambil pesan setelah `seq` terakhir (`?after=<seq>`).
- Polling diperlambat saat `document.visibilityState !== "visible"`.

## 2. Database

```prisma
enum ChatStatus { OPEN CLOSED }
enum ChatSender { VISITOR AGENT BOT SYSTEM }

model ChatConversation {
  id               String     @id @default(cuid())
  tokenHash        String     @unique          // SHA-256 dari token cookie
  visitorName      String
  visitorPhone     String
  visitorEmail     String?
  trackingNumber   String?
  customerId       String?
  assignedToId     String?
  status           ChatStatus @default(OPEN)
  unreadForAgent   Int        @default(0)
  unreadForVisitor Int        @default(0)
  lastMessageAt    DateTime   @default(now())
  createdAt        DateTime   @default(now())
  messages         ChatMessage[]

  @@index([status, lastMessageAt])
  @@index([visitorPhone])
  @@map("chat_conversations")
}

model ChatMessage {
  id             String     @id @default(cuid())
  seq            Int        @default(autoincrement())   // cursor polling
  conversationId String
  sender         ChatSender
  userId         String?                                 // CS yang membalas
  body           String     @db.Text
  createdAt      DateTime   @default(now())

  @@index([conversationId, seq])
  @@map("chat_messages")
}
```

Migration: file SQL di `scripts/migrations/` (pola `CREATE TABLE IF NOT EXISTS`),
dijalankan dengan `psql` di server sebelum deploy build.

## 3. Identitas pengunjung (kepemilikan room)

- Saat mulai chat, server membuat token acak 32 byte dan mengirimnya sebagai cookie
  `idm_chat` (`HttpOnly; Secure; SameSite=Lax; Path=/api/v1/chat; Max-Age=30 hari`).
- Database hanya menyimpan `tokenHash`. API publik tidak pernah menerima ID room;
  room ditentukan dari cookie.
- Ganti perangkat / cookie hilang → mulai chat baru. Di dashboard, percakapan dengan
  nomor HP yang sama ditandai "Pernah chat sebelumnya" dan riwayatnya bisa dibuka.
- Nomor HP **tidak** dipakai sebagai kunci akses room.

## 4. Bot sambutan

- Dibuat dalam transaksi yang sama dengan percakapan, sender `BOT`, tampil sebagai
  "IDM Assistant · otomatis". Hanya sekali per percakapan; tidak menambah
  `unreadForAgent`.
- Teks dipilih berdasarkan jam kerja (sambutan biasa / CS offline).
- Variabel template: `{nama}`, `{jam_kerja}`.

### Tombol pilihan cepat

- Ditampilkan di bawah pesan sambutan sampai pengunjung mengirim pesan pertama.
- Klik → teks tombol terkirim sebagai pesan `VISITOR`.
- Daftar tombol diatur di Settings. Tombol bawaan: "Cek status resi",
  "Tanya tarif", "Jadwal pickup".

### Jawaban otomatis status resi

- Tombol "Cek status resi" punya aksi khusus `track`. Kalau percakapan punya
  `trackingNumber`, bot langsung membalas dengan `getPublicTracking()`:
  status terakhir, lokasi, waktu update, estimasi tiba, dan link ke
  `/tracking/<resi>`.
- Data yang dibalas sama dengan halaman tracking publik (tidak ada data baru terbuka).
- Resi tidak ditemukan / belum diisi → bot meminta nomor resi; pesan berikutnya yang
  cocok pola resi (`IDM` + angka) dicek sekali lagi, selebihnya diteruskan ke CS.
- Setelah jawaban bot, percakapan tetap OPEN dan CS tetap bisa membalas.

### Pengaturan (`Setting`, group `chat`)

| Key | Isi |
|---|---|
| `chat.enabled` | Widget aktif / tidak |
| `chat.welcome` | Pesan sambutan jam kerja |
| `chat.welcomeOffline` | Pesan di luar jam kerja |
| `chat.hours` | Jam & hari kerja, mis. `{"days":[1,2,3,4,5,6],"open":"08:00","close":"17:00"}` (WIB) |
| `chat.quickReplies` | JSON daftar tombol `[{ "label": "...", "action": "track" \| "text" }]` |

## 5. API

Publik (`src/app/api/v1/chat/`), rate limit memakai `src/lib/rate-limit.ts`:

- `POST /chat/conversations` — mulai chat (3 / 10 menit per IP, honeypot)
- `GET /chat/messages?after=<seq>` — polling
- `POST /chat/messages` — kirim pesan (maks 2000 karakter, 20 / menit)
- `POST /chat/quick-reply` — klik tombol pilihan cepat
- Status aktif, jam kerja, dan daftar tombol dikirim ke widget langsung dari layout publik
  (tanpa request tambahan).

Dashboard (login + permission `chat:read` / `chat:write`):

- `GET /chat/admin/conversations?status=OPEN|CLOSED`
- `GET /chat/admin/conversations/[id]` — detail + riwayat chat dari nomor HP yang sama
- `GET /chat/admin/conversations/[id]/messages?after=`
- `POST /chat/admin/conversations/[id]/messages`
- `PATCH /chat/admin/conversations/[id]` — tutup, assign, tautkan Customer
- `GET /chat/admin/unread` — badge sidebar

Logika di `src/services/chat.service.ts`, validasi Zod di `src/lib/validators/chat.ts`.

## 6. UI

- `src/components/chat/chat-widget.tsx` di layout publik: tombol bulat kanan bawah +
  badge, form mulai chat (nama, HP, resi opsional), percakapan, tombol pilihan cepat.
- `src/app/(dashboard)/chat/page.tsx`: daftar percakapan (Open/Closed, unread) +
  isi percakapan, panel info pengunjung (HP, resi, tombol WhatsApp, "Pernah chat"),
  tombol tutup chat.
- Menu "Chat" di sidebar dengan badge unread; judul tab `(n) Chat`.
- Settings › Chat untuk teks sambutan, jam kerja, tombol pilihan cepat.
- Permission baru `chat:read`, `chat:write` untuk SUPER_ADMIN, ADMIN, CUSTOMER_SERVICE.

## 7. Tahapan

**Fase 1**

1. Schema Prisma + SQL migration
2. `chat.service.ts` + validator + unit test (cursor `seq`, unread, token, jam kerja,
   jawaban resi)
3. API publik + dashboard
4. Bot sambutan, tombol pilihan cepat, jawaban otomatis status resi
5. Widget publik
6. Halaman `/chat` + badge sidebar
7. Settings › Chat
8. Uji end-to-end lokal (dua browser: pengunjung & CS)

**Fase 2 (sesuai permintaan)**

- Kirim foto (pakai ulang kompresi & penyimpanan foto tracking)
- Template balasan cepat untuk CS
- Notifikasi email / WhatsApp ke CS
- Riwayat chat di halaman detail Customer
- Pembersihan otomatis percakapan lama

## 8. Deploy

1. Jalankan SQL migration di server sebelum upload zip.
2. Upload `next-build.zip`, ekstrak, dan `git pull` bila ada file baru di `public/`.
3. `pkill -9 -u "$(whoami)" node` untuk restart (`touch tmp/restart.txt` saja tidak cukup).

## 9. Belum dikonfirmasi client

- Field wajib pengunjung: nama + HP cukup, atau perlu email?
- Jam & hari kerja CS, serta isi pesan sambutan.
- Semua CS melihat semua chat, atau dibagi per cabang?
