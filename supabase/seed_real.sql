-- ============================================
-- SEED DATA REAL — News + FAQs
-- Jalankan setelah reset_full.sql
-- ============================================

-- Hapus berita lama & insert 3 berita real
DELETE FROM public.news;

INSERT INTO public.news (title, slug, content, tags, is_active, created_at)
VALUES
(
  'Berawal dari Media Sosial, Komunitas SukaBernyanyi Menjadi Ruang Positif bagi Anak Muda Sukabumi',
  'berawal-dari-media-sosial-komunitas-sukabernyanyi-menjadi-ruang-positif-bagi-anak-muda-sukabumi',
  '<p><strong>SUKABUMI</strong> &ndash; Sebuah wadah kreatif baru bagi generasi muda di Sukabumi kini tengah berkembang pesat melalui komunitas SukaBernyanyi. Terbentuk secara resmi pada 27 September 2025, komunitas ini unik karena berawal dari pertemuan sederhana sejumlah individu yang saling mengenal melalui media sosial Twitter/X.</p><p>Pendiri SukaBernyanyi, Enji Winangoen, mengungkapkan bahwa gerakan ini terinspirasi dari komunitas serupa di Singapura yang membuktikan bahwa musik mampu menyatukan orang-orang yang sebelumnya tidak saling mengenal.</p><p>Awalnya, komunitas ini hanya diikuti oleh tujuh orang yang berkumpul secara spontan untuk bernyanyi bersama tanpa rasa takut dinilai. Namun, antusiasme yang besar mengubah pertemuan kecil tersebut menjadi gerakan kolektif yang terbuka bagi siapa saja yang ingin mencari teman baru atau sekadar berekspresi melalui musik. Ke depannya, SukaBernyanyi menargetkan untuk menyelenggarakan acara skala besar dengan partisipasi lebih dari 200 orang serta menjadi pelopor komunitas hiburan di kategori seni dan musik di Sukabumi.</p>',
  ARRAY['Profil Komunitas'],
  true,
  '2025-10-25T10:00:00Z'
),
(
  'Musik Tumbuh di Akar Komunitas, SukaBernyanyi Vol. 3 Sukses Tingkatkan Partisipasi Peserta',
  'musik-tumbuh-di-akar-komunitas-sukabernyanyi-vol-3-sukses-tingkatkan-partisipasi-peserta',
  '<p><strong>SUKABUMI</strong> &ndash; Semangat kreativitas anak muda Sukabumi semakin terlihat nyata dalam gelaran SukaBernyanyi Vol. 3 yang diadakan pada Minggu, 19 Oktober 2025. Kegiatan ini mencatatkan lonjakan jumlah partisipan yang signifikan, di mana peserta meningkat dari hanya tujuh orang pada volume perdana menjadi tujuh puluh peserta pada gelaran ketiga ini. Peningkatan ini dipandang sebagai indikator kuat bahwa musik telah menjadi medium efektif untuk mempererat jejaring kreatif di Sukabumi.</p><p>Berbeda dengan ajang pencarian bakat pada umumnya, SukaBernyanyi menekankan pada konsep berjejaring dan berbagi suara, bukan kompetisi atau seleksi ketat. Tanpa sekat usia maupun latar belakang, para peserta datang untuk menciptakan ekosistem musik yang ramah dan terbuka. Atmosfer kolektif ini diharapkan dapat terus membangun ruang aman dan suportif bagi anak muda Sukabumi untuk produktif dalam berkarya.</p>',
  ARRAY['Event Report'],
  true,
  '2025-10-22T10:00:00Z'
),
(
  'Wakil Wali Kota Sukabumi Apresiasi SukaBernyanyi sebagai Wadah Penguatan Kreativitas Pemuda',
  'wakil-wali-kota-sukabumi-apresiasi-sukabernyanyi-sebagai-wadah-penguatan-kreativitas-pemuda',
  '<p><strong>SUKABUMI</strong> &ndash; Wakil Wali Kota Sukabumi, Bobby Maulana, secara langsung menghadiri dan memberikan apresiasi tinggi terhadap perkembangan komunitas musik lokal melalui ajang SukaBernyanyi Vol. 3. Dalam sambutannya, ia menyatakan bahwa kegiatan ini merupakan bukti nyata pertumbuhan kreativitas masyarakat yang mampu memperkuat solidaritas antarpelaku seni di daerah. Bobby Maulana juga berbagi pengalaman pribadinya yang tumbuh bersama musik sejak masa sekolah, sehingga ia merasa bangga bisa hadir di tengah ekosistem kreatif tersebut.</p><p>Pemerintah Kota Sukabumi menegaskan komitmennya untuk terus memberikan ruang apresiasi dan membuka peluang kolaborasi bagi inisiatif berbasis komunitas seperti ini. Selain sebagai ajang hiburan, kegiatan SukaBernyanyi dinilai memiliki peran penting dalam pembentukan karakter dan penguatan potensi anak muda. Pemerintah berharap ruang-ruang kreatif ini dapat terus dipertahankan dan tumbuh lebih luas agar memberikan dampak sosial yang positif bagi lingkungan sekitar.</p>',
  ARRAY['Apresiasi'],
  true,
  '2025-10-24T10:00:00Z'
);

-- Insert FAQ
DELETE FROM public.faqs;

INSERT INTO public.faqs (question, answer, display_order, is_active) VALUES
(
  'Apakah ada latihan dulu sebelum acara?',
  'Tidak ada latihan khusus sebelum acara. Namun, pada hari-H akan ada latihan bersama dalam beberapa sesi agar nyanyian lebih bagus dan berharmoni.',
  1,
  true
),
(
  'Apakah tempat acaranya selalu sama?',
  'Belum! Lokasi acara akan berpindah-pindah di beberapa kafe di Sukabumi supaya tiap volume punya suasana baru dan pengalaman yang berbeda. Komunitas juga terbuka untuk sponsorship venue bagi pemilik kafe yang ingin berkolaborasi.',
  2,
  true
),
(
  'Kalau sudah bayar di volume sebelumnya, apakah perlu bayar lagi di volume berikutnya?',
  'Iya, setiap volume adalah acara terpisah, jadi pembayaran dilakukan per-event. Setiap volume dijanjikan memiliki keseruan dan pengalaman baru yang selalu sepadan (worth it).',
  3,
  true
),
(
  'Kalau saya sudah registrasi tapi tidak bisa datang apakah fee boleh direfund?',
  'Sayangnya, fee tidak bisa di-refund dan tidak dapat di-reschedule. Namun, Anda diperbolehkan memindahtangankan tiket tersebut ke orang lain agar tetap bisa digunakan.',
  4,
  true
),
(
  'Apakah yang sudah ikut otomatis jadi member komunitas?',
  'Belum otomatis. Anda akan dimasukkan ke grup komunitas umum setelah mengikuti minimal satu volume. Dari sana, Anda bisa aktif berdiskusi dan menjadi bagian dari komunitas SukaBernyanyi.',
  5,
  true
),
(
  'Apakah ada jadwal rutin untuk kumpul?',
  'Belum ada jadwal mingguan atau bulanan tetap. Setiap acara akan diumumkan melalui Instagram, TikTok, dan grup WhatsApp. Jadi, pastikan untuk selalu memantau informasi terbaru.',
  6,
  true
),
(
  'Apakah ada batasan umur atau status tertentu?',
  'Tidak ada sama sekali. SukaBernyanyi terbuka untuk semua usia dan latar belakang. Yang terpenting adalah suka menyanyi dan ingin healing bareng lewat musik.',
  7,
  true
),
(
  'Apakah harus punya suara bagus untuk ikut?',
  'Enggak! Tagline komunitas ini adalah "Gak harus penyanyi, yang penting mau nyanyi." Fokus utamanya adalah keseruan, kebersamaan, dan rasa nyaman bareng. Cukup datang dengan hati yang senang dan niat nyanyi bareng.',
  8,
  true
);
