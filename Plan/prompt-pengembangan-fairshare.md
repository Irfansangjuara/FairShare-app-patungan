# Prompt Pengembangan FairShare

Saya ingin mengembangkan website FairShare yang sudah ada di https://fairshare.copilotmarketing.id/. Pelajari struktur proyek, fitur, database, autentikasi, dan pola UI yang berlaku sebelum melakukan perubahan. Pertahankan fitur yang sudah berjalan dan buat implementasi baru yang konsisten dengan arsitektur proyek.

## Kebutuhan fitur

### 1. Nomor rekening peserta

- Tambahkan field “Nomor rekening” pada setiap input data peserta/user di dalam campaign.
- Tentukan tempat penyimpanan yang tepat agar nomor rekening bisa digunakan kembali bila peserta yang sama ditambahkan ke campaign lain.
- Tampilkan nomor rekening pada halaman detail peserta dan bagian lain yang relevan untuk proses pembagian atau pembayaran.

### 2. Referensi kategori pengeluaran

- Pada form input pengeluaran, sediakan pilihan kategori yang cukup lengkap dan relevan, misalnya konsumsi, transportasi, akomodasi, belanja, tagihan, hiburan, kesehatan, dan lain-lain.
- Tetap sediakan opsi “Lainnya / Tulis sendiri” agar user bisa membuat kategori atau keterangan pengeluaran khusus.
- Pastikan pilihan kategori mudah dicari, bisa digunakan di tampilan riwayat pengeluaran, dan tidak merusak data pengeluaran yang sudah ada.

### 3. Saran peserta dari campaign sebelumnya

- Simpan riwayat nama peserta yang pernah dimasukkan oleh user pada campaign sebelumnya.
- Saat user membuat campaign baru dan menambahkan peserta, tampilkan saran peserta berdasarkan riwayat tersebut.
- Sediakan pencarian/autocomplete, pilihan untuk menambahkan peserta dari saran, serta opsi memasukkan peserta baru secara manual.
- Batasi saran berdasarkan akun atau workspace yang berwenang agar data peserta milik user lain tidak tercampur.
- Jika peserta yang dipilih memiliki nomor rekening tersimpan, isi otomatis field terkait dengan tetap memberi user kesempatan untuk mengubahnya.

### 4. Integrasi bot Telegram dan AI berbasis suara

- Tambahkan halaman pengaturan untuk menghubungkan bot Telegram menggunakan token bot yang dimasukkan oleh user.
- Buat alur interaksi suara: user mengirim voice message ke bot Telegram, sistem memproses audio menjadi teks, meneruskan teks ke LLM yang dipilih, lalu mengirim respons kembali melalui Telegram. Jelaskan dan implementasikan apakah respons berupa teks, suara, atau keduanya.
- Sediakan konfigurasi provider AI: DeepSeek, Claude, Gemini, OpenCode Go, 9Router, dan OpenRouter. User dapat memasukkan API key/credential miliknya sendiri.
- Sediakan dua cara memilih model: memilih dari daftar model umum yang sesuai dengan provider atau mengetik ID model secara manual. Jangan menganggap semua provider memiliki format API atau dukungan model yang sama; buat adaptor sesuai kemampuan masing-masing provider.
- Sediakan tombol “Tes koneksi Telegram” dan “Tes koneksi AI” dengan hasil yang jelas, termasuk pesan kesalahan yang mudah dipahami.
- Simpan token bot dan API key dengan aman serta jangan tampilkan nilainya secara utuh di UI.
- Pastikan bot hanya dapat mengakses data campaign sesuai otorisasi user yang terhubung.

### 5. Halaman publik dan blog

- Buat halaman-halaman dasar website yang diperlukan, seperti Beranda, Tentang, Kontak, Kebijakan Privasi, dan Syarat & Ketentuan, dengan desain yang konsisten.
- Buat halaman daftar artikel di `/blog` dan halaman detail artikel dengan URL yang ramah SEO.
- Sertakan judul, slug, ringkasan, isi artikel, gambar unggulan bila tersedia, tanggal publikasi, metadata SEO, serta status draft/published.
- Pastikan artikel draft tidak dapat diakses oleh pengunjung publik.

### 6. Pengaturan halaman standar untuk SEO

- Buat halaman pengaturan agar admin dapat mengelola konten halaman standar tanpa mengubah kode, terutama Beranda, Tentang, Kontak, Kebijakan Privasi, dan Syarat & Ketentuan.
- Untuk setiap halaman, sediakan pengaturan nama halaman, slug/URL, judul halaman, isi konten, gambar utama bila diperlukan, status publikasi, dan urutan navigasi.
- Sediakan field SEO per halaman: SEO title, meta description, canonical URL, pengaturan index/noindex, serta gambar dan deskripsi untuk tampilan saat tautan dibagikan (Open Graph).
- Sediakan pengaturan SEO global, seperti nama website, deskripsi default, gambar Open Graph default, dan format judul halaman.
- Buat `sitemap.xml` dan `robots.txt` yang mengikuti status publikasi serta pengaturan index/noindex setiap halaman.
- Pastikan halaman memiliki struktur heading yang jelas, URL yang konsisten, dan metadata yang sesuai dengan kontennya.
- Sediakan pratinjau tampilan hasil pencarian sebelum perubahan SEO dipublikasikan.

### 7. Admin artikel

- Buat halaman admin di `/admin` dengan login dan pembatasan akses berdasarkan role admin.
- Admin dapat membuat, mengedit, menyimpan draft, memublikasikan, dan menghapus artikel.
- Sertakan editor artikel yang nyaman dipakai, pengelolaan slug dan metadata SEO, serta pratinjau sebelum publikasi.
- Jika yang dimaksud “ghost artikel” adalah artikel yang dibuat menggunakan Ghost CMS, evaluasi integrasi Ghost secara terpisah dan jelaskan opsi implementasinya terlebih dahulu. Jangan mengasumsikan Ghost CMS wajib digunakan tanpa konfirmasi.

### 8. API dan token untuk AI agent

- Buat API terdokumentasi agar AI agent eksternal dapat mengakses fungsi FairShare yang diizinkan.
- Sediakan mekanisme pembuatan, penamaan, pembatasan izin/scope, rotasi, dan pencabutan token API dari halaman pengaturan.
- Terapkan autentikasi token, otorisasi per user/workspace, rate limiting, dan validasi input.
- Pisahkan endpoint baca dan tulis. Untuk aksi yang mengubah data keuangan/campaign, pastikan agent hanya dapat bertindak sesuai scope token dan aturan konfirmasi yang ditetapkan aplikasi.
- Buat dokumentasi endpoint, contoh request/response, dan contoh cara AI agent memakai token tersebut.

## Ketentuan pengerjaan

- Mulai dengan audit singkat atas implementasi saat ini. Sebutkan fitur yang sudah tersedia, perubahan database yang diperlukan, serta potensi risiko kompatibilitas.
- Berikan rencana implementasi bertahap sebelum mengubah kode.
- Implementasikan perubahan secara bertahap tanpa merusak data dan fitur lama; sertakan migrasi database bila diperlukan.
- Pastikan tampilan responsif dan konsisten dengan desain FairShare.
- Tambahkan pengujian untuk autentikasi, otorisasi, saran peserta, integrasi bot/LLM, halaman publik, SEO, blog, dan API agent.
- Setelah selesai, berikan daftar file yang diubah, instruksi konfigurasi environment variable, cara menjalankan migrasi, cara menguji setiap fitur, dan catatan keterbatasan yang masih ada.

Jangan mengklaim sebuah integrasi atau fitur sudah berfungsi sebelum diuji. Jika ada kebutuhan yang ambigu atau layanan yang belum jelas dukungan API-nya, jelaskan asumsi dan minta keputusan sebelum mengimplementasikan bagian tersebut.
