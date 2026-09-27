# Evaluasi Integrasi Ghost CMS vs Built-in FairShare CMS

Dokumen ini disusun untuk menjawab poin evaluasi pada kebutuhan fitur artikel:
> *"Jika yang dimaksud “ghost artikel” adalah artikel yang dibuat menggunakan Ghost CMS, evaluasi integrasi Ghost secara terpisah dan jelaskan opsi implementasinya terlebih dahulu. Jangan mengasumsikan Ghost CMS wajib digunakan tanpa konfirmasi."*

---

## 1. Perbandingan Arsitektur

| Kriteria | Built-in FairShare CMS (Saat Ini) | Ghost CMS Headless Integration |
| :--- | :--- | :--- |
| **Penyimpanan Data** | PostgreSQL internal (tabel `articles`) | MySQL terpisah pada server Ghost |
| **Infrastruktur & Biaya** | Rp 0 tambahan (terintegrasi dalam Next.js Vercel/VPS) | Butuh VPS/Droplet tambahan untuk Ghost Server atau $11/bln Ghost(Pro) |
| **Kecepatan & Latensi** | Instan (kueri database internal dengan Drizzle ORM) | HTTP API call melalui jaringan eksternal (Ghost Content API) |
| **Dukungan SEO & Metadata** | 100% Native Next.js 16 Metadata API + Live SERP Google preview | Diterjemahkan dari meta tag Ghost ke Next.js metadata |
| **Status Draft & Akses Publik** | Proteksi role admin internal; publik 404 jika draft | Tergantung status draft di dashboard Ghost |
| **Kemudahan Pengelolaan** | Satu dashboard terpadu di `/admin/articles` | Harus login ke dashboard admin Ghost yang terpisah |

---

## 2. Pilihan Implementasi Ghost CMS (Bila Dikehendaki di Masa Depan)

Jika tim Anda di kemudian hari memutuskan untuk memakai Ghost CMS asli untuk tim penulis editorial, berikut dua arsitektur yang dapat dihubungkan ke FairShare:

### Opsi A: Ghost Headless Content API (Rekomendasi jika memakai Ghost)
1. Ghost CMS di-host secara mandiri (misal: di DigitalOcean, Railway, atau Ghost(Pro)).
2. Buat Custom Integration di Ghost Admin > Settings > Integrations untuk memperoleh **Content API Key** dan **API URL**.
3. Di proyek FairShare Next.js, pasang SDK `@tryghost/content-api`.
4. Endpoint `/blog` dan `/blog/[slug]` mem-fetch artikel dari Content API Ghost.
5. Buat webhook di Ghost Admin yang menembak `/api/revalidate?secret=...` di Next.js saat artikel diterbitkan/diubah.

### Opsi B: Built-in Next.js CMS (Sudah Diimplementasikan Saat Ini)
- Administrator dapat langsung menulis, menyusun slug, menentukan status draft/published, dan mengatur SEO tags di `/admin/articles`.
- Zero latency, tanpa biaya langganan tambahan, dan tidak membutuhkan server database terpisah.

---

## 3. Kesimpulan & Rekomendasi
Solusi **Built-in FairShare CMS** yang telah diimplementasikan saat ini adalah pilihan paling efisien, stabil, dan terintegrasi penuh dengan sistem otentikasi role admin serta sistem SEO dinamis FairShare.
