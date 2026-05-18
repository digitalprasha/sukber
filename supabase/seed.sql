-- ============================================
-- Seed Data: Sample News & Events
-- ============================================

-- Sample News
INSERT INTO public.news (title, slug, tags, content, thumbnail_url, is_active)
VALUES
  (
    'Konser Amal SukaBernyanyi Sukses Digelar',
    'konser-amal-sukabernyanyi-sukses',
    ARRAY['konser', 'amal', 'komunitas'],
    '<h2>Malam Penuh Harmoni</h2><p>Konser amal yang digelar oleh SukaBernyanyi Sukabumi pada akhir pekan lalu berhasil mengumpulkan dana sebesar Rp 50 juta untuk pendidikan anak-anak kurang mampu di Sukabumi.</p><p>Acara yang berlangsung di Gedung Juang 45 ini menampilkan puluhan penampil dari berbagai genre musik, mulai dari pop, jazz, hingga tradisional Sunda.</p><blockquote><p>"Terima kasih untuk semua yang telah berpartisipasi. Ini bukti bahwa musik bisa menjadi alat untuk berbagi kebahagiaan." — Ketua SukaBernyanyi</p></blockquote>',
    '',
    true
  ),
  (
    'Workshop Vokal Gratis untuk Pemula',
    'workshop-vokal-gratis-pemula',
    ARRAY['workshop', 'vokal', 'gratis'],
    '<h2>Belajar Bernyanyi Bersama</h2><p>SukaBernyanyi membuka pendaftaran workshop vokal gratis untuk pemula yang akan diadakan setiap hari Sabtu di bulan ini.</p><p>Workshop ini akan dibawakan oleh instruktur vokal berpengalaman dari Jakarta. Peserta akan belajar teknik pernapasan, artikulasi, dan interpretasi lagu.</p><p>Kuota terbatas! Daftar segera melalui halaman acara kami.</p>',
    '',
    true
  ),
  (
    'Kolaborasi dengan Komunitas Musik Bandung',
    'kolaborasi-komunitas-musik-bandung',
    ARRAY['kolaborasi', 'komunitas', 'bandung'],
    '<p>SukaBernyanyi Sukabumi menjalin kerjasama dengan komunitas musik dari Bandung untuk menggelar seri acara "Sukabumi-Bandung Music Connect".</p><p>Acara ini akan digelar setiap bulan secara bergantian di Sukabumi dan Bandung, dengan tujuan mempererat tali silaturahmi antar komunitas musik di Jawa Barat.</p>',
    '',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Sample Events
INSERT INTO event_management.events (title, slug, flyer_url, ticket_prefix, description)
VALUES
  (
    'Sukabumi Music Festival 2026',
    'sukabumi-music-festival-2026',
    '',
    'SMF',
    '<h2>Festival Musik Terbesar di Sukabumi</h2><p>Bergabunglah dalam perayaan musik terbesar tahun ini! Tampil: band-band lokal, musisi jalanan, dan bintang tamu spesial.</p><ul><li>📅 Sabtu, 15 Agustus 2026</li><li>📍 Lapangan Merdeka Sukabumi</li><li>🎫 Tiket: Rp 50.000 (presale) / Rp 75.000 (OTS)</li></ul>'
  ),
  (
    'Night of Jazz: SukaBernyanyi Edition',
    'night-of-jazz-sukabernyanyi',
    '',
    'NJZ',
    '<h2>Malam Jazz yang Tak Terlupakan</h2><p>Nikmati alunan jazz di bawah bintang bersama musisi jazz terbaik Sukabumi.</p><p>Acara ini akan menghadirkan suasana intimate dengan pencahayaan temaram dan hidangan khas Sukabumi.</p><p>Dress code: Smart Casual. Bawa kamera untuk mengabadikan momen!</p>'
  ),
  (
    'Lomba Nyanyi Anak-Anak Se-Sukabumi',
    'lomba-nyanyi-anak-sukabumi',
    '',
    'LNA',
    '<h2>Cari Bakat Muda Sukabumi</h2><p>SukaBernyanyi mengadakan lomba nyanyi untuk anak-anak usia 6-12 tahun se-Sukabumi.</p><p>Hadiah utama: Paket kursus vokal gratis selama 3 bulan + uang pembinaan.</p><p>Pendaftaran gratis! Daftarkan putra-putri anda sekarang.</p>'
  )
ON CONFLICT (slug) DO NOTHING;

-- Sample Sponsors
INSERT INTO event_management.sponsors (event_id, logo_url, name)
SELECT e.id, '', 'Bank Jabar'
FROM event_management.events e WHERE e.slug = 'sukabumi-music-festival-2026'
UNION ALL
SELECT e.id, '', 'Radio Swara Sukabumi'
FROM event_management.events e WHERE e.slug = 'sukabumi-music-festival-2026'
UNION ALL
SELECT e.id, '', 'Kopi Nusantara'
FROM event_management.events e WHERE e.slug = 'night-of-jazz-sukabernyanyi';
