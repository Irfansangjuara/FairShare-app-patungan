# FairShare — Aplikasi Patungan & Pelunasan Cerdas 💰

Aplikasi web modern untuk mencatat biaya bersama dalam trip atau kegiatan, menghitung jatah dan saldo setiap peserta secara presisi, menyusun usulan transfer pelunasan sederhana (deterministik greedy), menandai checklist pelunasan persisten, serta menyalin rekap siap kirim ke WhatsApp.

Aplikasi di-deploy ke Vercel: **[https://fairshare.copilotmarketing.id](https://fairshare.copilotmarketing.id)**

---

## 🌟 Fitur Utama

- **Pembagian Rata & Adil (Integer Rupiah)**:
  - Pembagian beban: `dasar = total div N`, `sisa = total mod N`. Sisa dialokasikan secara deterministik (berdasarkan `created_at` lalu `id`), memastikan **selisih rupiah Rp 0**.
  - Invarian matematika terbukti: `Total Beban = Total Pengeluaran` dan `Total Saldo Bersih = Rp 0`.
- **Rekomendasi Transfer Pelunasan Sederhana (Greedy Deterministik)**:
  - Menghilangkan transfer silang antaranggota dengan mencocokkan debitur terbesar ke kreditur terbesar secara terurut.
- **Checklist Pelunasan Persisten**:
  - Pengelola dapat menandai setiap instruksi transfer sebagai `Lunas` atau `Belum Lunas`.
  - Status tersimpan langsung di database PostgreSQL dan bertahan setelah refresh.
  - Dilengkapi efek animasi konfeti saat seluruh transfer selesai dilunasi.
- **Rekap Siap Kirim WhatsApp**:
  - Tombol 1-klik untuk menyalin rekap rapi berformat teks WhatsApp ke clipboard, lengkap dengan status pelunasan.
  - Opsi fallback salin manual dan tombol direct share ke WhatsApp.
- **Tautan Berbagi Baca-Saja (Public Read-Only)**:
  - Tautan acak unik di `/share/[token]` untuk dibagikan ke anggota grup tanpa perlu login.
  - Hak akses terlindungi: pengunjung tidak dapat menambah, mengedit, atau menghapus data event.
- **Autentikasi Google OAuth**:
  - Masuk cepat dan aman menggunakan akun Google (tanpa repot menghafal kata sandi).
- **Desain & Estetika (Diskon.com Design System)**:
  - Mengadaptasi sistem desain Diskon.com: Tipografi **Fredoka**, angka mata uang monospace **JetBrains Mono**, tombol pil (*pill buttons*) hitam & aksen *lime* (`#b7e913`), kartu rounded 24px, chip surplus emerald dan defisit rose.
  - Memenuhi standar aksesibilitas WCAG 2.2 AA dan responsif penuh hingga layar ponsel 360px.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Styling**: Tailwind CSS & CSS Tokens
- **Database & ORM**: PostgreSQL & [Drizzle ORM](https://orm.drizzle.team/)
- **Autentikasi**: Google OAuth 2.0 (OpenID Connect)
- **Pengujian**: Node Native Test Runner (`npm test`)

---

## 🚀 Menjalankan di Localhost

### 1. Prasyarat
- Node.js v18+ (disarankan v20+)
- PostgreSQL lokal (atau database cloud Neon/Supabase)

### 2. Konfigurasi Lingkungan (`.env`)
Salin `.env.example` menjadi `.env` dan sesuaikan nilainya:

```env
DATABASE_URL=postgresql://localhost:5432/fairshare
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Wajib: nilai ACAK minimal 32 karakter. Tidak ada fallback di kode, dan nilai
# contoh yang pernah ter-commit akan DITOLAK (fails closed).
SESSION_SECRET=<hasil-generate-acak>

# Akun administrator di-bootstrap dari environment (tidak ada kredensial di kode).
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<password-kuat-anda>

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Generate `SESSION_SECRET` dengan:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 3. Instalasi Dependensi & Migrasi Database
```bash
npm install
npm run db:migrate
```

> Skema database juga **migrasi otomatis** saat aplikasi pertama kali menyentuh
> database (`ensureDatabaseSchema`), sehingga `db:migrate` hanya perlu dijalankan
> bila Anda ingin memverifikasi lebih awal.

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser di **[http://localhost:3000](http://localhost:3000)**.

---

## ☁️ Pengaturan Deployment Vercel

Pada dashboard proyek di **Vercel**, tambahkan Environment Variables berikut:

1. `DATABASE_URL`: Connection string PostgreSQL cloud (misal Neon / Supabase / Vercel Postgres) dengan `sslmode=require`.
2. `NEXT_PUBLIC_APP_URL`: `https://fairshare.copilotmarketing.id`
3. `SESSION_SECRET`: String **acak** minimal 32 karakter untuk menandatangani state OAuth dan token session-sync. Nilai contoh lama dari repo akan ditolak.
4. `ADMIN_EMAIL` + `ADMIN_PASSWORD`: akun administrator dibuat/di-rotate dari nilai ini saat aplikasi start. **Tanpa keduanya, `/admin` tidak dapat diakses** (fail-closed) dan akun default lama tetap dinonaktifkan.
5. `GOOGLE_CLIENT_ID`: Google OAuth Client ID.
6. `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret.
7. `GOOGLE_REDIRECT_URI`: `https://fairshare.copilotmarketing.id/api/auth/google/callback`

> [!IMPORTANT]
> Di **Google Cloud Console (Credentials)**, tambahkan kedua URL berikut pada **Authorized redirect URIs**:
> 1. `http://localhost:3000/api/auth/google/callback` (untuk pengujian lokal)
> 2. `https://fairshare.copilotmarketing.id/api/auth/google/callback` (untuk versi live di Vercel)

> [!NOTE]
> **AI Agent resmi (opsional).** Token agent tidak lagi ditanam di kode. Set
> `FAIRSHARE_AGENT_TOKEN` (nilai acak ≥ 32 karakter) dan `FAIRSHARE_AGENT_EMAIL`
> (harus menunjuk akun yang sudah ada) bila Anda memakai otomasi artikel/API.

---

## 🧪 Pengujian Otomatis

Jalankan test suite untuk memvalidasi formatting rupiah, alokasi sisa pembulatan, dan benchmark PRD Bagian 8:
```bash
npm test
```
