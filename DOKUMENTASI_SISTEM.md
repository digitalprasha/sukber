# Dokumentasi Sistem — SukaBernyanyi Sukabumi

> Platform manajemen event komunitas berbasis web dengan sistem tiket, QR scanner, dan role-based access control.

---

## 1. Arsitektur Teknis

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL via Supabase |
| Auth | Google OAuth (staff only) |
| Storage | Supabase Storage (gambar, bukti bayar) |
| CSS | Tailwind CSS v4 |
| Editor | Tiptap (rich text) |
| QR Code | html5-qrcode + qrcode |
| Deploy | Vercel (otomatis dari GitHub) |

---

## 2. Database Schema

### Schema `public` (tabel permanen)

| Tabel | Fungsi |
|---|---|
| `staff` | Akun admin/staff (email + role) |
| `news` | Berita |
| `gallery` | Galeri foto/video |
| `faqs` | FAQ |
| `partners` | Mitra/partner |
| `contact_info` | Informasi kontak (key-value) |
| `audit_logs` | Log aktivitas (append-only) |

### Schema `event_management` (tabel per-event, bisa di-reset)

| Tabel | Fungsi |
|---|---|
| `events` | Event dengan pengaturan pendaftaran |
| `participants` | Peserta pendaftar |
| `sponsors` | Sponsor per-event |

### Kolom penting `events`

```
id, title, slug, description, flyer_url, ticket_prefix, is_active,
registration_enabled, registration_fee, max_participants,
registration_deadline, payment_methods (JSONB), created_at
```

### Kolom penting `participants`

```
id, event_id, name, email, whatsapp, payment_proof_url, status,
registration_number, is_checked_in, admin_note, created_at
```

### Status peserta

| Status | Arti |
|---|---|
| `pending` | Mendaftar, menunggu verifikasi |
| `verified` | Disetujui, tiket diterbitkan |
| `checked_in` | Sudah check-in di acara |

---

## 3. Role & Hak Akses

| Role | Dashboard | Events | News | Gallery | FAQ | Partners | Tickets | Scanner | Logs | Kontak | Users |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **super_admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **developer** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **panitia** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (view only) | ✅ | ❌ | ❌ | ❌ |
| **scanner** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

**Catatan:** `super_admin` dan `developer` adalah akun protes (tidak bisa dihapus/diedit).  
Akun seed: `sukabernyanyis@gmail.com` (super_admin), `digitalprasha@gmail.com` (developer).

---

## 4. Alur Penggunaan — Publik (Pengunjung)

### 4.1 Menjelajahi Website

```
1. Buka https://suka-bernyanyi-smi.vercel.app
2. Lihat hero section dengan parallax + tagline
3. Scroll ke bawah:
   - Berita terbaru (4 card) → klik "Baca Selengkapnya" atau "Lihat Semua Berita"
   - Event aktif (6 card) → klik "Lihat Detail" untuk info lengkap
   - Galeri (6 foto/video terbaru) → klik "Lihat Semua Galeri"
   - FAQ (akordion, klik pertanyaan untuk lihat jawaban)
   - Partner (marquee infinite scroll logo)
4. Klik navigasi di header: Berita | Acara | Galeri
```

### 4.2 Membaca Berita

```
1. Dari homepage, klik "Lihat Semua Berita" atau menu "Berita" di navbar
2. Halaman /berita: grid kartu berita, cari judul di search bar
3. Klik kartu berita → baca artikel lengkap
4. Klik tombol share untuk bagikan link
```

### 4.3 Melihat Event & Mendaftar

```
1. Dari homepage, klik "Lihat Detail" pada event atau menu "Acara"
2. Halaman /acara: grid kartu event
3. Klik "Lihat Detail" pada event yang diminati
4. Baca informasi event: flyer, deskripsi, fee, kuota, deadline
5. Jika pendaftaran dibuka, klik "Daftar Sekarang"
6. Isi form pendaftaran:
   a. Nama lengkap
   b. Email aktif
   c. Nomor WhatsApp (ketik 08xxx → otomatis jadi +628xxx)
   d. Upload bukti pembayaran (foto/scan)
7. Centang checkbox konfirmasi
8. Klik "Daftar" → status "Menunggu Verifikasi"
9. Tunggu admin approve → terima link tiket via WA/Email
```

> **Catatan:** Email/WA yang sudah disetujui (verified/checked_in) untuk event yang sama TIDAK BISA daftar lagi. Harus hubungi admin.

### 4.4 Melihat Galeri

```
1. Dari homepage, klik "Lihat Semua Galeri" atau menu "Galeri"
2. Halaman /galeri: grid foto/video (12 per halaman)
3. Klik navigasi halaman untuk lihat lebih banyak
4. Video YouTube bisa diputar langsung di halaman
```

### 4.5 Melihat Tiket

```
1. Buka link tiket dari WA/Email: /ticket/{nomor_registrasi}
2. Halaman tiket menampilkan:
   - Logo SukaBernyanyi (100px)
   - QR Code (warna emerald)
   - Nomor registrasi (contoh: SBS-VOL8-001)
   - Nama peserta
   - Nama event
3. Tunjukkan QR code di pintu masuk untuk di-scan
4. Setelah di-scan, muncul badge "SUDAH CHECK-IN"
```

---

## 5. Alur Penggunaan — Admin

### 5.1 Login & Akses

```
SEMUA ROLE:
1. Buka /admin/login
2. Klik "Masuk dengan Google"
3. Pilih akun Google
4. Sistem cek email di tabel staff:
   ✓ Terdaftar → masuk ke dashboard
   ✗ Tidak terdaftar → auto logout + tampil warning "AKUN ANDA TIDAK TERDAFTAR!"
5. Setelah login, sidebar menampilkan menu sesuai role
```

### 5.2 Super Admin & Developer

> **Akses penuh ke semua fitur.** Dua akun ini tidak bisa dihapus/diedit.

#### Mengelola Event

```
1. Buka menu "Events" di sidebar
2. Melihat daftar event (search, pagination)
3. Membuat event baru:
   a. Klik "Tambah Event"
   b. Isi judul → slug otomatis
   c. Upload flyer, tulis deskripsi (Rich Text)
   d. Atur pendaftaran:
      - Toggle aktif/nonaktif
      - Fee pendaftaran
      - Kuota maksimal peserta
      - Deadline pendaftaran
   e. Tambah metode pembayaran:
      - Pilih BANK atau E-WALLET
      - Isi nama bank/e-wallet
      - Isi nomor rekening/akun
      - Centang konfirmasi kebenaran nomor
   f. Isi kode event (contoh: SBS-VOL8 → tiket: SBS-VOL8-001)
   g. Klik "Simpan"
4. Mengedit event: klik ikon pensil
5. Reset event: klik ikon reset → centang konfirmasi → reset
   (hapus semua peserta + sponsor, event tetap ada)
6. Hapus event: klik ikon tong sampah
7. Download CSV peserta:
   a. Klik ikon download
   b. Baca warning data rahasia
   c. Klik "Lanjutkan Download"
   d. File CSV siap dengan header warning
```

#### Menambahkan Sponsor ke Event

```
1. Saat buat/edit event, scroll ke bagian "Sponsor"
2. Klik "Tambah Sponsor"
3. Upload file logo (auto-compress <500KB)
4. Isi nama sponsor (hanya terlihat admin)
5. Klik "Simpan"
```

#### Mengelola Tiket & Verifikasi Peserta

```
1. Buka menu "Tickets"
2. Filter event (dropdown) atau cari nama/email/no registrasi
3. Lihat daftar peserta dengan status:
   - Pending (oranye) — menunggu verifikasi
   - Verified (hijau) — sudah disetujui
   - Checked In (kuning) — sudah hadir
4. Approve peserta:
   a. Klik centang pada peserta pending
   b. Konfirmasi → nomor registrasi otomatis tergenerate
   c. Klik "Send WA" atau "Send Email" untuk kirim link tiket
5. Kirim pesan ke peserta (tanpa mengubah status):
   a. Klik "X" pada peserta
   b. Tulis pesan di textarea
   c. Klik "Kirim Pesan" → otomatis buka WA + Email
6. Check-in manual: klik ikon check-in
```

#### Scanner (Check-in via QR)

```
1. Buka menu "Scanner"
2. Izinkan akses kamera
3. Arahkan kamera ke QR code tiket peserta
4. Sistem otomatis deteksi:
   ✓ Sukses → tampil data peserta + animasi hijau
   ✗ Duplikat → peringatan sudah check-in
   ✗ Invalid → QR code tidak dikenal
5. Alternatif: input nomor registrasi manual
```

#### Mengelola Berita

```
1. Buka menu "News"
2. Klik "Tambah" → isi judul, slug otomatis
3. Tulis konten dengan Rich Text Editor:
   - Bold, italic, heading, list
   - Upload gambar langsung dari editor
   - Embed video YouTube
4. Atur thumbnail (opsional)
5. Klik "Simpan" → tampil di halaman /berita + homepage
6. Toggle aktif/nonaktif untuk sembunyikan/tampilkan
```

#### Mengelola Galeri

```
1. Buka menu "Gallery"
2. Klik "Tambah"
3. Pilih jenis:
   - Image: upload file gambar
   - YouTube: tempel link YouTube
4. Isi keterangan singkat
5. Klik "Simpan" (ada loading spinner selama upload)
6. Toggle untuk tampil/sembunyikan
```

#### Mengelola FAQ

```
1. Buka menu "FAQ"
2. Klik "Tambah FAQ"
3. Isi pertanyaan + jawaban
4. Atur urutan tampil
5. Toggle aktif/nonaktif
6. FAQ aktif tampil di landing page (akordion)
```

#### Mengelola Partners

```
1. Buka menu "Partners"
2. Klik "Tambah Partner"
3. Upload logo partner
4. Isi nama partner
5. Pilih kategori: Partnership / Sponsorship / Collaborator / Media Partner
6. Isi URL website (opsional, bisa diklik)
7. Toggle aktif/nonaktif
8. Partner aktif tampil di landing page (marquee scroll)
```

#### Mengelola Staff (Super Admin & Developer Only)

```
1. Buka menu "Pengguna"
2. Lihat daftar staff (email + role + tanggal daftar)
3. Tambah staff baru:
   a. Klik "Tambah Staff"
   b. Masukkan email
   c. Pilih role (dropdown)
   d. Klik "Simpan"
4. Edit role staff: klik ikon pensil
5. Hapus staff: klik ikon tong sampah
   (tidak bisa menghapus super_admin & developer)
```

> **Catatan:** Staff login dengan Google OAuth. Tidak perlu password. Cukup email terdaftar.

#### Melihat Log Aktivitas

```
1. Buka menu "Logs"
2. Lihat riwayat semua aktivitas admin
3. Data append-only: tidak bisa dihapus/diubah
```

#### Mengelola Kontak

```
1. Buka menu "Kontak"
2. Edit field:
   - Instagram
   - Email
   - Alamat
   - WhatsApp Admin (baru)
3. Klik "Simpan"
4. Data tampil di footer website
```

### 5.3 Admin

> Sama seperti Super Admin, **kecuali**: tidak bisa mengelola staff (menu Pengguna tidak muncul di sidebar).

### 5.4 Panitia

> Akses terbatas untuk membantu operasional acara.

```
Menu yang tersedia:
1. Dashboard — lihat statistik (view only)
2. Tickets — lihat daftar peserta (view only, tidak bisa approve)
3. Scanner — check-in peserta via QR

TIDAK bisa mengakses: Events, News, Gallery, FAQ, Partners, Logs, Kontak, Pengguna
```

### 5.5 Scanner

> Akses minimal hanya untuk check-in.

```
Menu yang tersedia:
1. Dashboard — lihat statistik (view only)
2. Scanner — check-in peserta via QR

TIDAK bisa mengakses: Events, Tickets, News, Gallery, FAQ, Partners, Logs, Kontak, Pengguna
```

---

## 6. Alur End-to-End: Dari Pendaftaran sampai Check-in

Step-by-step dari sisi publik + admin:

```
═══════════════════════════════════════════════════════════
PUBLIC                              ADMIN
═══════════════════════════════════════════════════════════
                                   1. Buat event + atur
                                      pendaftaran (fee,
                                      kuota, deadline,
                                      metode bayar)

2. Buka halaman event
3. Klik "Daftar Sekarang"
4. Isi form + upload
   bukti bayar
5. Klik "Daftar"
   → status: PENDING
                    ═══►  6. Buka Tickets, lihat
                             bukti bayar

                            7a. OK → Approve
                                    → Generate tiket
                                      SBS-{code}-{001}
                                    → Kirim WA/Email
                                      link tiket

                            7b.有问题 → Kirim Pesan
                                      (WA + Email, status
                                      tetap PENDING)

8. Terima link tiket
   via WA/Email
9. Buka tiket → QR code

                                   10. Buka Scanner
                                   11. Scan QR (atau
                                       input manual)
                                   12. Check-in sukses
                                   13. Tiket badge
                                       "SUDAH CHECK-IN"
```

```
1. Pengunjung buka halaman event (/acara/[slug])
2. Klik "Daftar Sekarang"
3. Isi form: Nama, Email, WhatsApp (auto-format +62), Upload Bukti Bayar
4. Centang konfirmasi
5. Submit → status "pending"
6. Admin cek di Tickets → lihat bukti bayar
7. Admin klik Approve:
   → Generate nomor: SBS-{kode}-{001}
   → Status jadi "verified"
8. Admin kirim WA/Email link tiket ke peserta
9. Peserta buka tiket (/ticket/{no}) → tampil QR code
10. Di acara, staff scanner scan QR → check-in
```

**Jika ada masalah pembayaran:**
- Admin kirim pesan via WA/Email (status tetap pending)
- Peserta bisa daftar ulang (setelah data sebelumnya direset admin)

---

## 7. Catatan Keamanan

- **RLS (Row Level Security):** Semua tabel dilindungi RLS. Mutasi admin melalui API route dengan `service_role`.
- **Upload gambar:** Dikompres <500KB via sharp, disimpan di Supabase Storage, disajikan via proxy `/api/files/`.
- **CSP:** Content Security Policy via middleware. Diperlukan `'unsafe-eval'` untuk Supabase SSR.
- **Rate limit:** 30 request per 10 detik untuk `/api/`.
- **Session:** Refresh token via middleware.
- **Logs:** Append-only, tidak bisa dihapus/diubah.

---

## 8. Lingkungan & Deploy

- **Production:** `https://suka-bernyanyi-smi.vercel.app`
- **GitHub:** `digitalprasha/sukber`
- **Supabase:** `iirvgaeilktpombttoyr.supabase.co`
- **Deploy:** Otomatis dari push ke branch `master`

### Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://iirvgaeilktpombttoyr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Catatan:** Di Vercel, `NEXT_PUBLIC_SITE_URL` harus diset ke URL production.

---

## 9. Migrasi SQL

Semua file migrasi ada di folder `supabase/`:
- `reset_full.sql` — Full schema + seed data
- `add_registration_settings.sql` — Tambah kolom registrasi ke events
- `add_admin_note.sql` — Tambah kolom admin_note ke participants
- `schema_views.sql` — Public views untuk event_management schema
- `seed_real.sql` — Seed data (berita, FAQ)

Setelah migrasi, refresh schema cache:
```sql
NOTIFY pgrst, 'reload schema';
```
