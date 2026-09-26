# Product Requirements Document — FairShare

**Versi:** 1.0 (draf untuk persetujuan)  
**Tanggal:** 26 September 2026  
**Status:** Usulan MVP; keputusan yang belum disepakati ditandai sebagai asumsi atau pertanyaan terbuka  
**Platform:** Web responsif  
**Bahasa antarmuka:** Bahasa Indonesia  
**Mata uang MVP:** Rupiah (IDR)

---

## 1. Ringkasan produk

FairShare adalah aplikasi web untuk mencatat biaya bersama dalam trip atau kegiatan, menghitung jatah dan saldo setiap peserta, menyusun usulan transfer pelunasan yang sederhana, menandai transfer yang sudah lunas, serta menyalin rekap siap kirim ke WhatsApp.

**Nilai inti:** dari catatan pengeluaran yang tersebar menjadi satu jawaban yang mudah ditindaklanjuti: *siapa membayar siapa, berapa nominalnya, dan apakah sudah lunas*. MVP mengikuti brief awal: setiap pengeluaran dibagi rata kepada seluruh peserta event. Pengecualian peserta dalam pengeluaran tertentu belum termasuk MVP.

**Contoh hasil:** untuk empat peserta dengan total Rp 934.000, jatah dasar masing-masing Rp 233.500. Aplikasi menampilkan siapa yang lebih dahulu membayar, siapa yang masih berutang, dan instruksi transfernya. Angka transaksi contoh dari brief harus diperlakukan sebagai *fixture hasil* yang baru valid bila data pengeluaran per pembayar mendukungnya.

## 2. Masalah dan peluang

### Masalah pengguna

1. Pengeluaran dicatat di berbagai chat atau ingatan peserta, sehingga mudah terlewat.
2. Menghitung total, jatah per orang, dan uang yang sudah ditalangi secara manual memakan waktu serta rawan kesalahan.
3. Transfer silang antaranggota membuat pelunasan sulit dipahami dan dicek.
4. Tidak ada status bersama yang jelas untuk transfer yang sudah selesai.
5. Rekap untuk grup WhatsApp sering perlu diketik ulang.

### Tujuan pengguna

Setelah memasukkan peserta dan pengeluaran, penyelenggara trip dapat melihat hasil pembagian yang dapat diperiksa, membagikan instruksi transfer, dan melacak penyelesaiannya tanpa spreadsheet.

### Sasaran pengguna

- **Penyelenggara trip:** membuat event, mengundang atau memasukkan peserta, mencatat biaya, dan membagikan rekap.
- **Peserta trip:** melihat porsi beban dan instruksi transfernya; pada MVP akses edit dapat dibatasi kepada pengelola event.
- **Pengguna serupa:** panitia acara kecil atau teman yang patungan kegiatan sekali jalan.

## 3. Sasaran produk dan ukuran keberhasilan

| Sasaran | Ukuran operasional | Target awal yang diusulkan |
|---|---|---|
| Cepat mulai | Waktu dari membuka aplikasi hingga event dengan minimal dua peserta dibuat | Median ≤ 2 menit pada uji kegunaan |
| Hasil perhitungan tepercaya | Kasus uji pembagian dan penyelesaian yang lolos | 100% kasus uji kritis; selisih pembulatan akhir Rp 0 |
| Mudah ditindaklanjuti | Event dengan minimal satu pengeluaran yang menghasilkan rekap tersalin | Ukur sebagai baseline pada peluncuran, tanpa target palsu |
| Status konsisten | Status lunas tetap benar setelah memuat ulang halaman | 100% pada uji integrasi |
| Cepat dipakai di ponsel | Alur input dan salin rekap dapat diselesaikan pada lebar layar 360 piksel | 100% alur kritis lulus uji manual |

**Catatan:** target waktu dan cakupan di atas adalah sasaran desain, bukan hasil riset pengguna. Analitik, jika dipasang, tidak boleh memuat nominal rinci atau nama peserta tanpa alasan dan persetujuan yang jelas.

## 4. Ruang lingkup

### MVP — wajib

- Buat, lihat, ubah, dan arsipkan event (judul, lokasi opsional, tanggal opsional).
- Tambah, ubah, dan hapus peserta selama aturan dependensi terpenuhi.
- Input, ubah, dan hapus pengeluaran dengan pembayar, deskripsi, dan nominal rupiah bulat.
- Pembagian rata seluruh peserta; total grup, jatah individu, nominal sudah dibayar, dan saldo bersih.
- Rekomendasi transfer debit ke kredit dengan algoritma greedy yang deterministik.
- Checklist lunas atau belum lunas per rekomendasi transfer, tersimpan di database.
- Salin rekap teks ke clipboard untuk ditempel ke WhatsApp.
- Tampilan responsif, ringkasan mudah dibaca, validasi dan keadaan kosong/error.
- Mekanisme akses yang melindungi data event; bentuk finalnya perlu diputuskan pada bagian pertanyaan terbuka.

### Di luar MVP

- Pembagian tidak rata, peserta berbeda per pengeluaran, pembobotan, atau pajak/tip khusus.
- Multimata uang, konversi kurs, pembayaran otomatis, koneksi rekening atau dompet digital.
- Integrasi WhatsApp Business API dan pengiriman pesan otomatis.
- Konfirmasi pembayaran oleh dua pihak, unggah bukti transfer, cicilan/transfer sebagian.
- Notifikasi, komentar, kolaborasi penyuntingan serentak, dan pembagian event lintas organisasi.
- Klaim bahwa algoritma greedy selalu menghasilkan jumlah transfer paling sedikit secara matematis.

## 5. Asumsi dan keputusan produk

1. Setiap pengeluaran dibagi rata ke **semua peserta aktif** pada event; hanya satu pembayar untuk setiap pengeluaran.
2. Nominal dicatat sebagai integer rupiah positif; tidak menerima pecahan rupiah.
3. Event membutuhkan sedikitnya dua peserta sebelum hasil pembagian dan penyelesaian ditampilkan.
4. Daftar peserta untuk event yang sudah memiliki pengeluaran tidak dapat ditambah atau dihapus pada MVP agar jatah historis dan status pelunasan tidak berubah diam-diam. Pengelola dapat memperbaiki nama; perubahan struktural memerlukan alur rekalkulasi lanjutan.
5. Settlement adalah **usulan transfer berdasarkan pengeluaran**, bukan bukti uang berpindah. Menandai lunas hanya menandai penyelesaian satu instruksi transfer.
6. Perubahan pengeluaran dapat mengubah rencana pelunasan. MVP menolak perubahan pengeluaran jika ada transfer bertanda lunas; pengelola perlu membatalkan status lunas terlebih dahulu, lalu melakukan perubahan. Ini mencegah histori pembayaran hilang tanpa disadari.
7. Ringkasan “saldo dasar” dihitung dari pengeluaran, tidak berkurang karena sebuah checklist lunas; tampilan menampilkan status pelunasan secara terpisah. Jika ingin melihat sisa kewajiban, jumlahkan transfer berstatus belum lunas.
8. Identitas dan model akses MVP belum diputuskan: rekomendasi adalah akun pengelola dengan tautan baca-saja terpisah, tetapi desain final membutuhkan persetujuan. Jangan meluncurkan event dengan URL tebakan atau tanpa kontrol akses.

## 6. Alur pengguna

1. Pengelola membuka FairShare, membuat event, mengisi judul, lokasi/tanggal bila perlu.
2. Pengelola menambahkan minimal dua peserta; setiap nama unik dalam satu event.
3. Pengelola mencatat pengeluaran dengan memilih pembayar, mengisi deskripsi dan jumlah.
4. Sistem menampilkan total, jatah per orang, total dibayar, saldo, serta rekomendasi transfer.
5. Pengelola memeriksa perhitungan, lalu menyalin rekap untuk dibagikan ke grup WhatsApp.
6. Ketika peserta melunasi transfer, pengelola mengubah status menjadi lunas; perubahan dapat dilihat kembali setelah memuat ulang.
7. Setelah semua transfer selesai, event dapat diarsipkan atau tetap tersedia sebagai catatan.

## 7. Kebutuhan fungsional dan kriteria penerimaan

### FR-01 — Event

- Pengelola dapat membuat event dengan judul wajib 3–120 karakter, lokasi opsional hingga 160 karakter, dan tanggal opsional.
- Daftar event menampilkan judul, tanggal, jumlah peserta, total pengeluaran, dan status arsip.
- Ubah judul/lokasi/tanggal tidak mengubah hasil perhitungan; pengarsipan tidak menghapus data.
- **Diterima jika:** event tetap ada setelah refresh; pengguna lain tanpa izin tidak dapat melihat atau mengubahnya.

### FR-02 — Peserta

- Tambah peserta dengan nama 1–80 karakter; trim spasi dan larang nama duplikat tanpa membedakan huruf besar/kecil dalam satu event.
- Nama dapat diperbaiki tanpa mengganti identitas peserta atau hubungan ke pengeluaran/transfer.
- Hapus peserta hanya bila belum ada pengeluaran dan transfer yang terkait; untuk MVP, larang perubahan jumlah peserta ketika event sudah memiliki pengeluaran.
- **Diterima jika:** nama duplikat dan nama kosong ditolak dengan pesan yang jelas; tidak ada referensi pembayar yang rusak.

### FR-03 — Pengeluaran

- Form cepat: pembayar wajib berasal dari event, deskripsi wajib 1–160 karakter, nominal wajib bilangan bulat rupiah > 0.
- Tampilkan daftar pengeluaran dengan pembayar, deskripsi, jumlah, dan waktu pencatatan; dukung ubah/hapus sesuai aturan pelunasan.
- Nilai tertinggi yang diterima mengikuti batas integer database dan batas produk yang ditetapkan saat implementasi; seluruh aritmetika uang tetap integer.
- **Diterima jika:** pengeluaran invalid ditolak di server, total diperbarui setelah transaksi tersimpan, dan event lain tidak dapat dipakai untuk menyuntikkan ID pembayar.

### FR-04 — Pembagian dan saldo

- Total event = jumlah semua pengeluaran; total dibayar peserta = jumlah pengeluaran yang dibayar peserta tersebut.
- Beban dibagi rata: `dasar = total div jumlah_peserta`, `sisa = total mod jumlah_peserta`; urutkan peserta berdasarkan waktu pembuatan lalu ID sebagai penentu seri, dan berikan tambahan Rp 1 kepada `sisa` peserta pertama.
- Saldo = dibayar − beban. Saldo positif berarti berhak menerima, negatif berarti perlu membayar, nol berarti impas.
- **Diterima jika:** jumlah beban = total, jumlah saldo = 0, dan tidak ada kehilangan rupiah saat total tidak habis dibagi jumlah peserta.

### FR-05 — Penyederhanaan transfer

- Urutkan debitur berdasarkan besar utang menurun, kreditur berdasarkan besar piutang menurun; seri ditentukan ID peserta untuk hasil yang stabil.
- Pada setiap iterasi, usulkan transfer `min(sisa_utang_debitur, sisa_piutang_kreditur)`, kurangi kedua saldo, lanjutkan hingga seluruh saldo nol.
- Jangan membuat transfer bernilai Rp 0 atau transfer ke diri sendiri.
- **Diterima jika:** seluruh utang/piutang terselesaikan, setiap nominal positif, dan setiap hasil input identik menghasilkan daftar rekomendasi yang sama. Greedy bertujuan menghasilkan rute sederhana, bukan jaminan optimum global jumlah transfer.

### FR-06 — Checklist pelunasan

- Setiap instruksi memiliki status `Belum lunas` atau `Lunas`, nilai awal `Belum lunas`; tampilkan jumlah instruksi belum lunas.
- Pengelola dapat mengubah status dua arah; simpan waktu perubahan dan, bila tersedia, identitas pengubah.
- Status transfer tetap ada setelah refresh selama data dasar tidak berubah.
- **Diterima jika:** setelah mengubah status dan memuat ulang, status benar; dua permintaan yang hampir bersamaan tidak menghasilkan duplikasi rekomendasi.

### FR-07 — Rekap siap WhatsApp

- Tombol “Salin rekap WhatsApp” menyalin teks biasa berformat rapi; tidak mengirim pesan otomatis.
- Isi minimum: judul event, tanggal/lokasi bila ada, total, jumlah peserta, jatah per orang atau jatah masing-masing saat terjadi pembulatan, ringkasan saldo, daftar transfer dan status lunas.
- Format angka Indonesia `Rp 934.000`; jika clipboard gagal, tampilkan pesan gagal serta area teks untuk salin manual.
- **Diterima jika:** hasil clipboard cocok dengan layar, dapat ditempel ke chat, dan tidak menyebut transfer sudah dibayar bila statusnya belum lunas.

### FR-08 — Akses dan keamanan

- Hanya pengelola yang sah dapat mengubah event, peserta, pengeluaran, dan status pelunasan. Jika tautan baca-saja diterapkan, pemilik tautan hanya dapat melihat rekap.
- Otorisasi diperiksa kembali pada setiap Server Action; ID dari formulir tidak dianggap bukti izin.
- Semua input teks disanitasi melalui rendering aman, bukan HTML mentah; pengubahan status menggunakan proteksi bawaan framework serta validasi server.
- **Diterima jika:** percobaan baca/tulis event milik pengguna lain ditolak; tautan baca-saja tidak dapat memanggil operasi tulis.

## 8. Aturan perhitungan dan contoh

### Definisi

Misalkan `T` adalah total pengeluaran, `N` jumlah peserta, `P_i` total yang dibayar peserta `i`, `B_i` jatah peserta `i`, dan `S_i = P_i − B_i` saldonya. Berlaku `sum(B_i) = T` serta `sum(S_i) = 0`.

**Ilustrasi yang dapat diverifikasi:** empat peserta, total Rp 934.000; setiap orang menanggung Rp 233.500. Agar hasil transfer dari brief awal valid, salah satu distribusi pembayar yang mungkin adalah Andri Rp 385.000, Tedy Rp 284.000, Irfan Rp 200.000, Rion Rp 65.000. Saldo berturut-turut: Andri +Rp 151.500; Tedy +Rp 50.500; Irfan −Rp 33.500; Rion −Rp 168.500. Rekomendasi yang memenuhi saldo: Rion → Andri Rp 118.000; Rion → Tedy Rp 50.500; Irfan → Andri Rp 33.500. Distribusi pembayar tersebut adalah **data uji yang dibangun agar cocok dengan hasil benchmark**, bukan data asli dari gambar.

**Pembulatan:** jika total Rp 100 dibagi tiga orang, beban deterministik menjadi Rp 34, Rp 33, Rp 33. Rekap harus menampilkan jatah per orang; jangan menyatakan ketiganya membayar tepat Rp 33,33.

**Perubahan data:** rekomendasi harus dihitung ulang secara atomik ketika pengeluaran berubah dan belum ada status lunas. Jangan memakai nomor urut tampilan sebagai identitas permanen suatu transfer.

## 9. Model data dan integritas

Skema awal mengikuti brief, dengan tambahan kolom operasional yang disarankan:

| Tabel | Kolom inti | Aturan |
|---|---|---|
| `events` | `id`, `owner_id`, `title`, `location`, `event_date`, `created_at`, `updated_at`, `archived_at` | `owner_id` mengacu ke identitas pengelola; model identitas diputuskan sebelum rilis |
| `members` | `id`, `event_id`, `name`, `created_at` | Nama unik per event secara case-insensitive setelah normalisasi |
| `expenses` | `id`, `event_id`, `paid_by_member_id`, `title`, `amount`, `created_at`, `updated_at` | `amount > 0`; pembayar harus menjadi peserta pada event yang sama |
| `settlements` | `id`, `event_id`, `from_member_id`, `to_member_id`, `amount`, `is_paid`, `paid_at`, `calculation_version`, `created_at`, `updated_at` | Nominal positif; pengirim berbeda dari penerima; dua peserta wajib dari event yang sama |

**Implementasi referensial:** gunakan UUID untuk ID dan `BIGINT` untuk rupiah; indeks pada semua kolom `event_id` dan referensi pembayar. Validasi kepemilikan peserta harus ditegakkan di server dalam transaksi; bila menggunakan constraint komposit database, cantumkan `(event_id, id)` pada tabel peserta sebagai target foreign key. Penghitungan ulang transfer serta pembaruan tabel `settlements` harus berada dalam satu transaksi agar pengguna tidak melihat saldo lama dan rencana baru secara campur. Jangan simpan kartu, rekening, atau kredensial pembayaran pada MVP.

**Keputusan persistensi:** `settlements` berisi snapshot rencana saat ini agar status lunas dapat disimpan. Pada perubahan pengeluaran sebelum ada status lunas, hapus dan bangun ulang snapshot secara transaksional sambil menaikkan `calculation_version`. Setelah ada status lunas, larang perubahan pengeluaran sampai status tersebut dibatalkan. Untuk histori pembayaran lebih kaya, gunakan ledger pembayaran pada versi berikutnya.

## 10. Layar dan pengalaman pengguna

| Layar/komponen | Isi utama | Aksi |
|---|---|---|
| Beranda / daftar event | Event aktif dan arsip, tombol buat event | Buat, buka, arsipkan |
| Buat/ubah event | Judul, lokasi, tanggal | Simpan |
| Detail event | Ringkasan total dan jumlah peserta; tab/section Pengeluaran, Peserta, Saldo, Transfer | Tambah pengeluaran/peserta, buka detail |
| Form pengeluaran | Pembayar, deskripsi, nominal dengan input angka yang nyaman di ponsel | Simpan, ubah, hapus |
| Rincian pembagian | Dibayar, beban, saldo tiap peserta dan penjelasan tanda surplus/defisit | Verifikasi |
| Rencana pelunasan | Asal, tujuan, nominal, status | Tandai lunas/belum |
| Rekap | Pratinjau teks serta tombol salin | Salin ke clipboard |

**Panduan visual:** gaya fintech yang bersih seperti kuitansi digital; font teks Plus Jakarta Sans atau Inter, angka JetBrains Mono. Emerald untuk surplus/lunas, rose untuk utang/belum lunas; jangan mengandalkan warna saja—sertakan label status, ikon, dan kontras memadai. Gunakan format tanggal Indonesia, `Rp` dan pemisah ribuan titik. Sediakan skeleton/loading, pesan kesalahan yang dapat diperbaiki, konfirmasi sebelum penghapusan, serta empty state yang mengarahkan ke tindakan berikutnya.

**Aksesibilitas minimum:** label formulir eksplisit, fokus keyboard terlihat, tombol bisa dioperasikan dengan keyboard, status dapat dibaca pembaca layar, dan elemen sentuh cukup luas di ponsel.

## 11. Persyaratan nonfungsional

- **Kinerja:** sasaran awal halaman detail event terasa responsif pada koneksi seluler; ukuran hasil, pengukuran performa nyata, dan ambang akhir ditetapkan setelah prototipe. Aritmetika seluruhnya deterministik di server; hindari pembacaan database berulang untuk setiap peserta.
- **Keandalan:** simpan perubahan menggunakan transaksi; tampilkan kegagalan penyimpanan tanpa memberi kesan data sudah tersimpan. Cadangkan data sesuai kemampuan layanan database dan uji pemulihan sebelum penggunaan nyata.
- **Privasi:** nama peserta serta nominal pengeluaran adalah data yang perlu dibatasi aksesnya. Hindari menaruh token baca atau data keuangan di log, analitik, dan metadata publik.
- **Keamanan:** rahasia database hanya di environment server; batasi akses database, validasi input dan otorisasi untuk semua operasi mutasi; gunakan koneksi terenkripsi. Jika memakai tautan berbagi, gunakan token acak yang sulit ditebak dan sediakan pencabutan tautan.
- **Konsistensi:** jangan cache halaman event pribadi sebagai konten publik; setelah mutasi, perbarui tampilan agar hasil server sama dengan data tersimpan.
- **Observabilitas:** catat kesalahan teknis dan waktu respons tanpa mencatat nama peserta atau nominal mentah bila tidak diperlukan.
- **Skalabilitas awal:** optimalkan untuk grup kecil; uji fungsional minimal 2–50 peserta dan 0–500 pengeluaran per event. Angka ini adalah batas uji yang diusulkan, bukan batas bisnis final.

## 12. Stack dan arsitektur implementasi

- **Frontend dan server:** Next.js App Router + TypeScript; Tailwind CSS untuk antarmuka; Server Components untuk tampilan awal, Client Components seperlunya untuk form interaktif dan clipboard.
- **Mutasi:** Server Actions untuk create/update/delete, validasi, otorisasi, dan invalidasi tampilan. Operasi finansial seperti rekalkulasi dilakukan dalam transaksi database.
- **Database:** Neon Serverless PostgreSQL. Gunakan driver atau ORM yang kompatibel dengan metode koneksi yang dipilih; simpan `DATABASE_URL` hanya pada environment server.
- **Deployment:** Vercel untuk aplikasi; Neon sebagai layanan database terpisah. Siapkan environment development, preview, dan production dengan database atau cabang terpisah serta migrasi yang jelas.
- **Identitas:** opsi akun pengelola dan tautan baca-saja direkomendasikan, tetapi provider dan desain login belum dipilih; ini bukan alasan untuk mengabaikan kebutuhan akses.
- **Pembagian logika:** letakkan perhitungan dalam modul fungsi murni yang diuji terpisah dari antarmuka dan akses database.

## 13. Pengujian dan kriteria rilis

### Matriks pengujian utama

| Kasus | Hasil yang diharapkan |
|---|---|
| Tanpa pengeluaran | Total Rp 0, saldo seluruh peserta Rp 0, tidak ada instruksi transfer |
| Satu pembayar, empat peserta | Semua peserta selain pembayar berutang sesuai jatah; total transfer = piutang pembayar |
| Total tidak habis dibagi peserta | Sisa rupiah dialokasikan deterministik; jumlah saldo tepat nol |
| Pembayar sudah impas | Tidak muncul transfer dari/ke pembayar tersebut |
| Nominal nol/negatif/desimal atau nama peserta asing | Ditolak oleh validasi server |
| Benchmark total Rp 934.000 dengan distribusi di bagian 8 | Tiga transfer dan nominal sesuai contoh setelah urutan deterministik diperhitungkan |
| Tandai lunas lalu refresh | Status, jumlah transfer belum lunas, dan teks rekap konsisten |
| Ubah pengeluaran ketika transfer sudah lunas | Ditolak dengan alasan jelas sampai status lunas dibatalkan |
| Akses event orang lain / perubahan via request langsung | Ditolak, tidak terjadi perubahan database |
| Clipboard tidak tersedia | Rekap dapat disalin manual melalui fallback |
| Dua mutasi bersamaan | Tidak ada settlement duplikat dan hasil akhir konsisten |

**Syarat rilis:** semua kasus kritis lulus; tidak ada selisih rupiah pada pengujian otomatis; audit otorisasi dasar lulus; alur end-to-end pada perangkat seluler berjalan; skema database dan migrasi production berhasil; rekap yang disalin cocok dengan data pada layar.

## 14. Tahapan pengerjaan

1. **Fondasi:** putuskan model akses dan aturan event, siapkan proyek Next.js, Neon, migrasi, skema, serta deployment preview.
2. **Data inti:** implementasi event, peserta, pengeluaran, validasi, dan otorisasi.
3. **Mesin hitung:** fungsi pembagian rupiah, saldo, rekomendasi transfer, fixture, dan pengujian otomatis.
4. **Pelunasan dan berbagi:** snapshot settlement, status lunas, pratinjau rekap, clipboard, dan fallback.
5. **Penyempurnaan:** responsif, aksesibilitas, pengujian alur lengkap, privasi, pemantauan kesalahan, dan rilis.

## 15. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Pembagian merata tidak cocok untuk semua biaya | Rekap dianggap tidak adil | Tampilkan aturan pembagian secara eksplisit; jadwalkan peserta per pengeluaran pada versi berikutnya |
| Perubahan pengeluaran sesudah pelunasan | Histori lunas menjadi tidak valid | Blokir perubahan sampai status lunas dibatalkan; beri penjelasan sebelum tindakan |
| Mengklaim jumlah transfer selalu minimum | Ekspektasi keliru | Gunakan istilah “rute transfer sederhana”, uji contoh, hindari janji optimum global |
| Data event terbuka bagi orang yang tidak berhak | Kebocoran nominal dan identitas | Tetapkan kepemilikan event, otorisasi server, token berbagi yang tidak dapat ditebak |
| Dua permintaan menghitung ulang sekaligus | Status atau transfer ganda | Transaksi, penguncian/versioning, dan pengujian konkurensi |
| Pembulatan rupiah tanpa aturan | Selisih Rp 1 atau lebih | Alokasi sisa secara deterministik; seluruh nominal integer |

## 16. Pertanyaan terbuka sebelum implementasi final

1. Apakah MVP perlu akun pengelola, tautan privat tanpa akun, atau keduanya? Siapa yang boleh melihat dan siapa yang boleh mengubah?
2. Apakah peserta juga boleh menandai lunas, atau hanya pengelola? Bila peserta boleh, bagaimana identitasnya diverifikasi?
3. Haruskah event tetap bisa menerima peserta baru setelah ada pengeluaran? Jika ya, apakah biaya lama dibagi ulang atau hanya biaya setelah mereka bergabung?
4. Jika sebuah biaya hanya dikonsumsi beberapa peserta, apakah ini wajib untuk rilis pertama? Jika ya, tambah tabel peserta-per-pengeluaran dan revisi perhitungan.
5. Apakah perlu mencatat pembayaran sebagian atau hanya status penuh lunas/belum?
6. Apakah pengeluaran yang sudah ada boleh dikoreksi sesudah ada pelunasan nyata? Jika ya, diperlukan ledger dan mekanisme rekonsiliasi, bukan sekadar regenerasi transfer.
7. Apakah tanggal event opsional dan apakah lokasi perlu ditampilkan pada rekap publik?
8. Apakah rekap WhatsApp berisi semua saldo peserta atau hanya daftar transfer agar lebih ringkas?

---

**Rekomendasi persetujuan PRD:** validasi jawaban bagian 16, terutama akses, cakupan pembagian biaya, dan perubahan sesudah lunas. Setelah itu dokumen dapat dikunci sebagai spesifikasi implementasi MVP.