---
title: 'Build FairShare MVP'
type: 'feature'
created: '2026-09-26'
status: 'in-progress'
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/PRD_FairShare_v1.md'
  - '{project-root}/DESIGN.md'
  - '{project-root}/SKILL.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Pengelola kegiatan membutuhkan aplikasi lokal yang menggantikan catatan patungan tersebar dengan perhitungan rupiah yang dapat diperiksa, instruksi pelunasan, status pembayaran persisten, dan rekap siap WhatsApp.

**Approach:** Bangun MVP web responsif end-to-end sesuai PRD menggunakan Next.js App Router, TypeScript, Tailwind, PostgreSQL/Drizzle, autentikasi email-kata sandi, serta tautan baca-saja bertoken acak. Docker PostgreSQL dipakai di localhost; `DATABASE_URL` yang sama dapat diarahkan ke Neon.

## Boundaries & Constraints

**Always:** Seluruh uang berupa `BIGINT`/`bigint` dan string pada batas UI; pembagian sisa rupiah dan greedy settlement deterministik; semua mutasi memvalidasi input, relasi event, dan kepemilikan di server; perubahan anggota dilarang setelah ada pengeluaran; perubahan pengeluaran dilarang ketika settlement lunas masih ada; rekalkulasi snapshot settlement atomik; hanya pemilik dapat menulis; token berbagi hanya dapat membaca; data tetap ada setelah refresh. UI mengadaptasi bahasa visual Diskon.com—Fredoka, komposisi lapang, heading tebal, bentuk pil, hitam-putih dengan aksen lime, biru, dan pink—melalui token semantik sendiri tanpa menyalin merek atau asetnya; setiap kontrol memiliki state default, hover, focus-visible, active, disabled, loading, dan error serta memenuhi WCAG 2.2 AA.

**Ask First:** Mengganti model autentikasi, mengizinkan peserta menulis, mengubah aturan pembagian rata, atau menambah deployment eksternal berbayar.

**Never:** Pecahan rupiah, pembagian selektif/tidak rata, pembayaran sebagian, unggah bukti, pengiriman WhatsApp otomatis, rekening/dompet digital, HTML mentah, rahasia atau token di log/client, URL event publik yang mudah ditebak, dan klaim greedy selalu minimum global.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Event normal | Pemilik membuat event, ≥2 anggota, pengeluaran valid | Total, beban, saldo, settlement, dan rekap konsisten serta persisten | Kesalahan simpan ditampilkan tanpa optimistic success |
| Pembulatan | Rp100 dibagi 3 anggota | Beban Rp34/Rp33/Rp33 menurut `created_at`, lalu ID | Tidak ada rupiah hilang; jumlah saldo nol |
| Benchmark | Andri 385k, Tedy 284k, Irfan 200k, Rion 65k | Tiga transfer sesuai PRD dengan tie-break stabil | Hasil identik untuk input identik |
| Data invalid | Nama duplikat/kosong, nominal ≤0/desimal, pembayar event lain | Mutasi ditolak server dengan pesan field-level | Database tidak berubah |
| Data terkunci | Ubah anggota setelah expense atau expense saat settlement lunas | Operasi ditolak dengan alasan dan tindakan pemulihan | Batalkan status lunas sebelum koreksi expense |
| Clipboard gagal | Clipboard API tidak tersedia/menolak | Tampilkan textarea rekap yang dapat disalin manual | Tidak mengklaim teks telah disalin |
| Akses ilegal | User lain atau tautan share memanggil mutasi | Respons ditolak dan data tidak berubah | Tidak membocorkan keberadaan/detail event |
| Mutasi bersamaan | Dua rekalkulasi expense berdekatan | Satu snapshot konsisten tanpa settlement duplikat | Row lock/transaksi menyerialkan perubahan |

</frozen-after-approval>

## Code Map

- `package.json`, `docker-compose.yml`, `.env.example` -- runtime, scripts, dan PostgreSQL localhost.
- `src/db/schema.ts`, `src/db/index.ts`, `drizzle/` -- skema users/sessions/events/members/expenses/settlements/share token serta migrasi.
- `src/lib/auth.ts`, `src/lib/validation.ts`, `src/lib/money.ts`, `src/lib/settlement.ts` -- sesi aman, batas input, format IDR, dan mesin hitung murni.
- `src/server/actions/*.ts`, `src/server/queries.ts` -- otorisasi, transaksi CRUD, rekalkulasi, dan proyeksi layar.
- `src/app/(auth)/**`, `src/app/(dashboard)/**`, `src/app/share/[token]/**` -- login/register, daftar/detail event pemilik, dan rekap baca-saja.
- `src/components/**`, `src/app/globals.css` -- form, kartu ringkasan, tabel/list responsif, status, dialog, clipboard fallback, loading/error/empty state.
- `tests/unit/**`, `tests/e2e/**` -- kontrak kalkulasi, validasi, persistensi, otorisasi, dan alur mobile.

## Tasks & Acceptance

**Execution:**
- [ ] `package.json`, konfigurasi, Docker, migrasi -- scaffold Next.js dan PostgreSQL yang dapat dijalankan lokal.
- [ ] `src/db/**`, `src/lib/auth.ts`, `src/middleware.ts` -- model data, registrasi/login/logout, sesi HttpOnly, ownership, dan share token hashed.
- [ ] `src/lib/settlement.ts`, `src/lib/money.ts` -- implementasi pure `bigint` untuk pembagian dan greedy deterministik.
- [ ] `src/server/**` -- CRUD tervalidasi dan transaksi row-lock yang membangun ulang settlement snapshot.
- [ ] `src/app/**`, `src/components/**` -- semua layar FR-01–FR-08 dalam Bahasa Indonesia, responsif 360px, keyboard-accessible.
- [ ] `tests/**` -- uji matriks kritis dan alur utama browser.

**Acceptance Criteria:**
- Given pengguna baru, when mendaftar dan login, then hanya event miliknya tampil dan sesi bertahan setelah refresh.
- Given event valid, when peserta serta pengeluaran dikelola, then ringkasan server selalu memenuhi jumlah beban = total dan jumlah saldo = nol.
- Given settlement ditandai lunas, when halaman dimuat ulang, then status, waktu perubahan, jumlah belum lunas, dan rekap tetap konsisten.
- Given tautan baca-saja aktif, when dibuka tanpa sesi pemilik, then rekap terlihat tetapi seluruh operasi tulis ditolak.
- Given viewport 360px dan desktop, when alur buat event hingga salin rekap dijalankan, then tidak ada overflow horizontal, semua kontrol dapat digunakan dengan keyboard/touch, fokus terlihat, dan tampilan konsisten dengan token visual rujukan Diskon.com.
- Given aplikasi bersih, when setup localhost dijalankan, then migrasi berhasil, server dapat dibuka, dan seluruh test/lint/build lulus.

## Spec Change Log

## Design Notes

Gunakan PostgreSQL lokal melalui Docker untuk hasil yang identik dengan target Neon, bukan database development kedua. Kunci row event di transaksi mutasi finansial; settlement diregenerasi hanya bila tidak ada baris `is_paid=true`. Token share mentah hanya berada di URL, sedangkan database menyimpan hash; pencabutan menghasilkan token baru.

Adaptasi Diskon.com pada sistem FairShare, bukan duplikasi landing page: kanvas putih lapang, wordmark hitam dengan aksen lime, Fredoka untuk UI, angka uang monospace, CTA pil hitam/lime, kartu besar beradius 24px, aksen biru/pink terukur, bayangan ringan, dan ilustrasi geometris orisinal. Data finansial tetap content-first; warna surplus/utang selalu didampingi label dan ikon.

## Verification

**Commands:**
- `docker compose up -d db && npm run db:migrate` -- database sehat dan migrasi selesai.
- `npm test` -- seluruh kontrak unit/integrasi lulus.
- `npm run lint && npm run build` -- tidak ada error lint/type/build.
- `npm run test:e2e` -- registrasi, CRUD, settlement, reload, share read-only, clipboard fallback, dan viewport 360px lulus.
