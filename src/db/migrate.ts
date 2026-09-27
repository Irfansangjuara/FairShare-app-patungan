import { db } from "./index.ts";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

let isSchemaEnsured = false;

export async function ensureDatabaseSchema(): Promise<void> {
  if (isSchemaEnsured) {
    return;
  }

  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  const isCloudOrProd =
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.VERCEL_URL);

  if (isCloudOrProd && !dbUrl) {
    throw new Error(
      "DATABASE_URL belum dikonfigurasi di Vercel Environment Variables. Silakan hubungkan database PostgreSQL cloud (seperti Neon / Supabase / Vercel Postgres Storage)."
    );
  }

  try {
    // 1. Try to enable uuid extension (non-fatal if restricted by provider)
    try {
      await db.execute(sql.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`));
    } catch {
      // Non-fatal, PostgreSQL 13+ has gen_random_uuid() built-in
    }

    // 2. Ensure each table and column exists one by one
    const tableStatements = [
      `CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        google_id text UNIQUE,
        name varchar(120) NOT NULL,
        avatar_url text,
        password_hash text,
        role varchar(20) DEFAULT 'user' NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      )`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id text`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(20) DEFAULT 'user' NOT NULL`,

      `CREATE TABLE IF NOT EXISTS sessions (
        id text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title varchar(120) NOT NULL,
        location varchar(160),
        event_date date,
        share_token text UNIQUE,
        archived_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS members (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name varchar(80) NOT NULL,
        bank_account text,
        created_at timestamptz DEFAULT now() NOT NULL
      )`,
      `ALTER TABLE members ADD COLUMN IF NOT EXISTS bank_account text`,
      `CREATE UNIQUE INDEX IF NOT EXISTS members_event_name_unique_idx ON members (event_id, lower(name))`,

      `CREATE TABLE IF NOT EXISTS saved_participants (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name varchar(80) NOT NULL,
        bank_account text,
        use_count integer DEFAULT 1 NOT NULL,
        last_used_at timestamptz DEFAULT now() NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS saved_participants_user_name_unique_idx ON saved_participants (user_id, lower(name))`,

      `CREATE TABLE IF NOT EXISTS expenses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        paid_by_member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
        title varchar(160) NOT NULL,
        category varchar(80) DEFAULT 'Umum' NOT NULL,
        amount bigint NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      )`,
      `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category varchar(80) DEFAULT 'Umum' NOT NULL`,

      `CREATE TABLE IF NOT EXISTS settlements (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        from_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        to_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        amount bigint NOT NULL,
        is_paid boolean DEFAULT false NOT NULL,
        paid_at timestamptz,
        calculation_version integer DEFAULT 1 NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS user_ai_settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        telegram_bot_token text,
        telegram_bot_username varchar(120),
        telegram_webhook_secret text,
        is_bot_active boolean DEFAULT false NOT NULL,
        telegram_chat_id text,
        ai_provider varchar(40) DEFAULT 'deepseek' NOT NULL,
        ai_api_key text,
        ai_model varchar(120) DEFAULT 'deepseek-chat' NOT NULL,
        custom_model_id varchar(120),
        voice_response_mode varchar(20) DEFAULT 'text' NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS articles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        author_id uuid REFERENCES users(id) ON DELETE SET NULL,
        title varchar(255) NOT NULL,
        slug varchar(255) NOT NULL UNIQUE,
        summary text,
        content text NOT NULL,
        featured_image text,
        status varchar(20) DEFAULT 'draft' NOT NULL,
        seo_title varchar(255),
        seo_description text,
        canonical_url text,
        is_noindex boolean DEFAULT false NOT NULL,
        published_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS site_pages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        key varchar(50) NOT NULL UNIQUE,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL UNIQUE,
        title varchar(255) NOT NULL,
        content text NOT NULL,
        featured_image text,
        is_published boolean DEFAULT true NOT NULL,
        nav_order integer DEFAULT 0 NOT NULL,
        seo_title varchar(255),
        seo_description text,
        canonical_url text,
        is_noindex boolean DEFAULT false NOT NULL,
        og_image text,
        og_description text,
        updated_at timestamptz DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS site_settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        key varchar(50) DEFAULT 'global' NOT NULL UNIQUE,
        site_name varchar(120) DEFAULT 'FairShare' NOT NULL,
        default_description text,
        default_og_image text,
        title_template varchar(120) DEFAULT '%s | FairShare' NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS api_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name varchar(100) NOT NULL,
        token_hash text NOT NULL UNIQUE,
        token_prefix varchar(16) NOT NULL,
        scopes text[] DEFAULT ARRAY['read:campaigns']::text[] NOT NULL,
        last_used_at timestamptz,
        expires_at timestamptz,
        is_revoked boolean DEFAULT false NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      )`
    ];

    for (const stmt of tableStatements) {
      await db.execute(sql.raw(stmt));
    }

    // 3. Ensure admin account exists with 'admin' role
    const adminPasswordHash = await bcrypt.hash("admin#123", 10);
    await db.execute(sql`
      INSERT INTO users (id, email, name, password_hash, role)
      VALUES (gen_random_uuid(), 'admin@admin.com', 'Administrator', ${adminPasswordHash}, 'admin')
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = ${adminPasswordHash}, role = 'admin';
    `);

    // 4. Seed default site settings if not exists
    await db.execute(sql`
      INSERT INTO site_settings (id, key, site_name, default_description, title_template, default_og_image)
      VALUES (
        gen_random_uuid(),
        'global',
        'FairShare',
        'Aplikasi kalkulator patungan dan pelunasan pengeluaran trip cerdas tanpa selisih Rp 1 pun.',
        '%s | FairShare',
        '/assets/img/fair-share-cover.webp'
      )
      ON CONFLICT (key) DO UPDATE SET 
        default_og_image = COALESCE(site_settings.default_og_image, '/assets/img/fair-share-cover.webp');
    `);

    // 5. Seed default standard pages if not exist
    const defaultPages = [
      {
        key: "about",
        name: "Tentang Kami",
        slug: "about",
        title: "Tentang FairShare",
        content: `FairShare adalah platform pintar yang dirancang untuk menyederhanakan perhitungan patungan dan pelunasan pengeluaran bersama.

Baik itu liburan bersama sahabat, traveling keluarga, kepanitiaan kantor, maupun makan bareng rekan kerja, FairShare menghilangkan kerumitan spreadsheet dan rumus manual yang membingungkan.

### Visi Kami
Menciptakan transparansi dan keadilan finansial dalam setiap kegiatan bersama dengan perhitungan matematika presisi integer rupiah, rute transfer pelunasan tersingkat, dan integrasi cerdas AI.`,
        nav_order: 1,
        seo_title: "Tentang Kami | FairShare Patungan Cerdas",
        seo_description: "Ketahui lebih lanjut tentang misi FairShare dalam menyederhanakan perhitungan patungan grup dan trip tanpa ribet.",
      },
      {
        key: "contact",
        name: "Kontak",
        slug: "contact",
        title: "Hubungi Tim FairShare",
        content: `Punya pertanyaan, saran fitur, atau membutuhkan bantuan teknis? Tim kami siap mendengarkan Anda.

### Saluran Komunikasi
- **Email Dukungan**: support@copilotmarketing.id
- **WhatsApp Support**: +62 823-5020-3300
- **Jam Operasional**: Senin – Jumat, 09:00 – 17:00 WIB

Silakan tinggalkan pesan kapan saja, dan kami akan merespons dalam waktu 1x24 jam kerja.`,
        nav_order: 2,
        seo_title: "Kontak & Bantuan | FairShare",
        seo_description: "Hubungi tim FairShare untuk bantuan teknis, pertanyaan fitur, dan saran pengembangan.",
      },
      {
        key: "privacy",
        name: "Kebijakan Privasi",
        slug: "privacy",
        title: "Kebijakan Privasi FairShare",
        content: `Privasi dan keamanan data Anda adalah prioritas utama kami di FairShare.

### 1. Informasi yang Kami Kumpulkan
Kami hanya mengumpulkan informasi yang diperlukan untuk menjalankan layanan, seperti:
- Informasi akun (Nama, Alamat Email)
- Data event/campaign yang Anda buat (Judul, Lokasi, Tanggal)
- Data peserta event dan nomor rekening/e-wallet yang Anda catat
- Catatan transaksi pengeluaran grup

### 2. Penggunaan Data
Data Anda digunakan semata-mata untuk:
- Melakukan kalkulasi pembagian beban dan rekomendasi transfer pelunasan
- Memberikan saran peserta dan nomor rekening pada event Anda selanjutnya
- Memproses perintah bot Telegram & AI jika Anda mengaktifkan integrasi tersebut

Kami tidak menjual data pribadi Anda kepada pihak ketiga mana pun.`,
        nav_order: 3,
        seo_title: "Kebijakan Privasi | FairShare",
        seo_description: "Kebijakan privasi FairShare mengenai pengumpulan dan perlindungan data pengguna dan kegiatan patungan.",
      },
      {
        key: "terms",
        name: "Syarat & Ketentuan",
        slug: "terms",
        title: "Syarat & Ketentuan Penggunaan",
        content: `Selamat datang di FairShare. Dengan menggunakan layanan kami, Anda menyetujui ketentuan berikut.

### 1. Penggunaan Layanan
FairShare menyediakan alat bantu kalkulasi dan pencatatan pembagian biaya. Pengguna bertanggung jawab penuh atas keakuratan data pengeluaran dan nomor rekening yang dimasukkan.

### 2. Tanggung Jawab Pembayaran
FairShare bukan lembaga keuangan atau penyedia payment gateway. Transfer uang aktual dilakukan secara mandiri oleh masing-masing peserta langsung ke rekening peserta yang dituju.

### 3. Batasan Tanggung Jawab
Kami berusaha memastikan sistem perhitungan akurat dan bebas dari kesalahan algoritma, namun kami tidak bertanggung jawab atas kesepakatan pribadi atau sengketa pembayaran antar anggota grup di luar aplikasi.`,
        nav_order: 4,
        seo_title: "Syarat & Ketentuan | FairShare",
        seo_description: "Syarat dan ketentuan pemakaian aplikasi patungan FairShare.",
      },
    ];

    for (const page of defaultPages) {
      await db.execute(sql`
        INSERT INTO site_pages (
          id, key, name, slug, title, content, is_published, nav_order, seo_title, seo_description
        )
        VALUES (
          gen_random_uuid(),
          ${page.key},
          ${page.name},
          ${page.slug},
          ${page.title},
          ${page.content},
          true,
          ${page.nav_order},
          ${page.seo_title},
          ${page.seo_description}
        )
        ON CONFLICT (key) DO NOTHING;
      `);
    }

    // Update existing contact page content if it has the old phone number
    await db.execute(sql`
      UPDATE site_pages 
      SET content = REPLACE(content, '+62 812-3456-7890', '+62 823-5020-3300') 
      WHERE content LIKE '%+62 812-3456-7890%';
    `);

    // 6. Seed 3 default blog articles
    const defaultArticles = [
      {
        title: "Panduan Lengkap Menggunakan FairShare: Hitung Patungan Hangout & Liburan Tanpa Selisih",
        slug: "panduan-penggunaan-fairshare-patungan-cerdas",
        summary: "Pelajari cara mudah mengelola pengeluaran liburan dan hangout bersama teman dengan FairShare. Mulai dari buat event, catat pengeluaran, hingga rute transfer pelunasan tercepat via WhatsApp.",
        featured_image: "/assets/img/fair-share-cover.webp",
        content: `Pernahkah Anda berlibur bersama teman-teman atau makan malam bersama keluarga, lalu saat waktu pembayaran tiba, semua orang bingung menghitung siapa yang berutang ke siapa? Rumus spreadsheet manual sering kali berakhir dengan selisih rupiah, perdebatan yang canggung, atau drama penagihan yang berlarut-larut.

FairShare hadir sebagai solusi cerdas untuk mengakhiri masalah klasik tersebut. Dengan algoritma penyelesaian transfer optimal (debt simplification), FairShare menjamin pembagian pengeluaran bersama berlangsung transparan, adil, dan presisi hingga angka satuan rupiah.

## Langkah 1: Buat Event Patungan Baru

Langkah pertama sangat mudah. Setelah Anda login ke akun FairShare:
- Klik tombol "Buat Event" di dashboard Anda.
- Masukkan nama kegiatan, misalnya: "Liburan Akhir Tahun ke Bali" atau "Dinner Hangout Senopati".
- Tambahkan lokasi dan tanggal kegiatan untuk mempermudah pengarsipan catatan bersama.
- Klik "Simpan & Lanjutkan" untuk membuka ruang event.

## Langkah 2: Tambahkan Semua Peserta & Nomor Rekening

Selanjutnya, daftarkan siapa saja teman atau anggota keluarga yang ikut dalam kegiatan tersebut:
- Klik tombol "Tambah Peserta".
- Masukkan nama peserta (contoh: Budi, Sinta, Irfan).
- Masukkan nomor rekening atau e-wallet (contoh: BCA 1234567890 a.n Budi atau GoPay 0812-3456-7890). Kolom ini sangat bermanfaat agar saat pelunasan nanti, teman Anda tidak perlu berulang kali bertanya nomor rekening tujuan transfer.
- Fitur pintar FairShare juga mengingat riwayat nama peserta, sehingga pada event berikutnya Anda cukup memilih nama mereka dari daftar saran cepat.

## Langkah 3: Catat Semua Pengeluaran Bersama

Setiap kali ada transaksi selama hangout atau traveling, Anda atau anggota grup bisa langsung mencatatnya secara terperinci:
- Klik "Tambah Pengeluaran".
- Masukkan deskripsi pengeluaran, misalnya: "Makan Siang Ikan Bakar Jimbaran" atau "Bensin & Tol Mobil".
- Masukkan nominal total rupiah.
- Pilih siapa anggota yang menalangi atau membayar tagihan tersebut di awal.
- Pilih kategori pengeluaran (Konsumsi, Transportasi, Akomodasi, Tiket Wisata, dll.) untuk memudahkan evaluasi anggaran grup.

## Langkah 4: Kalkulasi Otomatis Tanpa Selisih Rp 1 Pun

Di sinilah keunggulan utama FairShare dibanding spreadsheet atau kalkulator biasa:
- FairShare otomatis membagi beban biaya secara merata ke seluruh peserta aktif.
- Jika ada pembagian desimal yang tidak habis (misalnya Rp 100.000 dibagi 3 orang), algoritma FairShare menggunakan metode remainder distribution deterministik sehingga total pembagian tetap pas 100% tanpa selisih Rp 1 pun.
- Algoritma penyelesaian pelunasan kami secara cerdas memangkas transaksi transfer berantai. Misalnya, jika A berutang ke B, dan B berutang ke C, sistem akan merekomendasikan rute transfer langsung dari A ke C untuk meminimalkan jumlah transaksi bank.

## Langkah 5: Bagikan Link Rekap WhatsApp & Pantau Pelunasan

Setelah semua pengeluaran selesai dicatat, saatnya menyelesaikan pembayaran dengan mudah:
- Klik tombol "Salin Rekap WhatsApp". Teks rekap rapi yang mencakup total biaya, rincian pengeluaran, siapa yang harus transfer ke siapa, beserta nomor rekening tujuan akan langsung tersalin ke clipboard Anda.
- Bagikan tautan live view event kepada seluruh anggota melalui grup chat. Setiap peserta dapat membuka halaman rekap kapan saja tanpa harus menginstal aplikasi tambahan.
- Begitu seorang anggota telah mentransfer uangnya, cukup centang status "Tandai Lunas" untuk memperbarui status grup.

Dengan FairShare, momen hangout dan traveling bersama sahabat kembali menyenangkan tanpa ada beban finansial atau rasa sungkan!`,
        seo_title: "Panduan Lengkap Menggunakan FairShare | Hitung Patungan Cerdas Tanpa Selisih",
        seo_description: "Panduan langkah demi langkah cara menggunakan FairShare untuk membagi biaya liburan dan hangout bersama teman secara adil dan transparan.",
        canonical_url: "https://fairshare.copilotmarketing.id/blog/panduan-penggunaan-fairshare-patungan-cerdas",
      },
      {
        title: "Mengapa Harus Mulai Berinvestasi Sejak Dini? Manfaat Finansial Masa Depan yang Nyata",
        slug: "manfaat-investasi-sejak-dini-kebebasan-finansial",
        summary: "Menabung saja tidak cukup untuk melawan inflasi. Pahami manfaat berinvestasi sejak dini, instrumen ramah pemula, dan cara mengalokasikan sisa uang patungan ke aset produktif.",
        featured_image: "/assets/img/fair-share-cover.webp",
        content: `Banyak orang mengira bahwa kunci kebebasan finansial hanyalah rajin menabung di rekening bank. Padahal di era ekonomi modern, menyimpan seluruh uang tunai di tabungan biasa justru membuat nilai riil kekayaan Anda tergerus perlahan-lahan oleh musuh tak terlihat yang bernama inflasi.

Investasi bukan lagi kegiatan eksklusif milik para pengusaha bermodal besar. Kini, dengan kemudahan teknologi digital, siapa pun dapat mulai berinvestasi bahkan dengan modal mulai dari puluhan ribu rupiah. Mengapa memulai investasi sedini mungkin adalah keputusan terbaik dalam hidup Anda?

## 1. Menjaga Daya Beli dari Gerusan Inflasi

Inflasi adalah kenaikan harga barang dan jasa secara umum yang terjadi dari tahun ke tahun. Uang Rp 50.000 sepuluh tahun lalu mungkin cukup untuk makan siang mewah berdua, namun hari ini mungkin hanya cukup untuk sepiring nasi dan minuman biasa:
- Bunga tabungan bank konvensional umumnya berkisar antara 0% hingga 1% per tahun, dan sering kali terpotong oleh biaya administrasi bulanan.
- Sementara laju inflasi rata-rata tahunan di Indonesia berkisar antara 3% hingga 5% per tahun.
- Melalui instrumen investasi seperti reksadana, obligasi negara, atau saham, potensi imbal hasil (return) tahunan dapat melampaui tingkat inflasi, sehingga nilai riil uang Anda tidak berkurang.

## 2. Memanfaatkan Kekuatan Waktu (Time Value of Money)

Aset paling berharga yang dimiliki oleh generasi muda bukanlah modal uang yang besar, melainkan waktu:
- Memulai investasi di usia 20-an dengan modal kecil jauh lebih menguntungkan daripada baru mulai berinvestasi di usia 40-an dengan modal berkali-kali lipat lebih besar.
- Waktu memberikan ruang bagi modal Anda untuk bertumbuh dan menghasilkan keuntungan bergulir yang sering disebut sebagai efek bola salju (snowball effect).

## 3. Membangun Passive Income dan Kemandirian Finansial

Tujuan akhir dari investasi bukanlah sekadar menjadi kaya raya dalam semalam, melainkan menciptakan kemandirian finansial (financial freedom):
- Investasi pada dividen saham atau kupon obligasi negara memberikan penghasilan pasif berkala tanpa mengharuskan Anda bekerja secara fisik setiap hari.
- Anda memiliki jaring pengaman finansial yang kuat saat menghadapi kondisi tak terduga, seperti resesi ekonomi atau pemutusan hubungan kerja.

## 4. Langkah Memulai: Dari Sisa Anggaran Hangout ke Aset Produktif

Bagaimana cara memulai investasi secara realistis tanpa mengorbankan gaya hidup Anda sehari-hari?
- Catat dan Evaluasi Pengeluaran: Gunakan aplikasi pengelolaan uang seperti FairShare untuk melihat ke mana aliran dana Anda saat hangout atau liburan. Sisa efisiensi anggaran dapat dialihkan ke pos investasi.
- Miliki Dana Darurat Terlebih Dahulu: Pastikan Anda memiliki dana darurat setara 3 hingga 6 bulan pengeluaran rutin sebelum masuk ke instrumen berisiko tinggi.
- Pilih Instrumen yang Tepat: Untuk pemula, mulailah dari instrumen berisiko rendah seperti Reksadana Pasar Uang (RPU) atau Surat Berharga Negara (SBN). Jika profil risiko Anda moderat hingga agresif, Anda dapat mempelajari Reksadana Saham atau Saham blue chip.
- Terapkan Dollar-Cost Averaging (DCA): Berinvestasilah secara rutin dan konsisten setiap bulan pada tanggal yang sama, tanpa terpengaruh oleh fluktuasi naik-turunnya pasar harian.

Kunci utama investasi bukanlah seberapa besar modal awal yang Anda miliki, melainkan seberapa cepat Anda memulai dan seberapa disiplin Anda mempertahankannya.`,
        seo_title: "Manfaat Investasi Sejak Dini | Bangun Kebebasan Finansial Masa Depan",
        seo_description: "Ketahui pentingnya berinvestasi sejak usia muda, menjaga daya beli dari inflasi, dan menciptakan passive income berkelanjutan.",
        canonical_url: "https://fairshare.copilotmarketing.id/blog/manfaat-investasi-sejak-dini-kebebasan-finansial",
      },
      {
        title: "Memahami Compounding Interest: Keajaiban Bunga Majemuk yang Menggandakan Aset Anda",
        slug: "penjelasan-compounding-interest-bunga-berbunga",
        summary: "Albert Einstein menyebut compounding interest sebagai keajaiban dunia ke-8. Pelajari cara kerja bunga majemuk, rumus perhitungannya, dan simulasi melipatgandakan kekayaan jangka panjang.",
        featured_image: "/assets/img/fair-share-cover.webp",
        content: `Fisikawan terkemuka Albert Einstein pernah dilaporkan berkata: "Bunga majemuk (compounding interest) adalah keajaiban dunia kedelapan. Siapa yang memahaminya, akan menghasilkannya; siapa yang tidak memahaminya, akan membayarnya."

Meskipun istilah ini terdengar teknis, konsep dasar bunga majemuk sebenarnya sangat sederhana: keuntungan yang menghasilkan keuntungan kembali. Ini adalah prinsip matematika paling kuat di dunia keuangan yang mampu mengubah tabungan rutin bernilai kecil menjadi kekayaan yang luar biasa dalam jangka panjang.

## Apa Itu Compounding Interest?

Dalam sistem bunga sederhana (simple interest), bunga hanya dihitung berdasarkan modal pokok awal. Jika Anda menginvestasikan Rp 10.000.000 dengan imbal hasil 10% per tahun, Anda akan menerima Rp 1.000.000 setiap tahun secara statis.

Sebaliknya, dalam sistem Compounding Interest (Bunga Majemuk / Bunga Berbunga):
- Tahun ke-1: Modal Rp 10.000.000 menghasilkan keuntungan 10% (Rp 1.000.000). Total saldo menjadi Rp 11.000.000.
- Tahun ke-2: Bunga 10% tidak lagi dihitung dari Rp 10.000.000, melainkan dari total saldo baru Rp 11.000.000. Keuntungan tahun kedua menjadi Rp 1.100.000. Saldo menjadi Rp 12.100.000.
- Tahun ke-3: Bunga 10% dihitung dari Rp 12.100.000, menghasilkan keuntungan Rp 1.210.000.
- Dan seterusnya: Keuntungan yang Anda peroleh ikut diinvestasikan kembali untuk menghasilkan lebih banyak imbal hasil.

## Simulasi Nyata: Efek Bola Salju dalam 30 Tahun

Mari kita lihat simulasi konkret jika seorang pemuda berusia 22 tahun mulai menyisihkan uang hangout sebesar Rp 500.000 per bulan ke instrumen investasi dengan rata-rata imbal hasil 10% per tahun:

- Tahun ke-10 (Usia 32 tahun): Total uang yang disetor dari kantong pribadi Rp 60.000.000. Nilai portofolio investasi mencapai sekitar Rp 103.000.000 (keuntungan bunga Rp 43.000.000).
- Tahun ke-20 (Usia 42 tahun): Total uang yang disetor Rp 120.000.000. Nilai portofolio investasi melonjak menjadi sekitar Rp 379.000.000 (keuntungan bunga Rp 259.000.000).
- Tahun ke-30 (Usia 52 tahun): Total uang yang disetor Rp 180.000.000. Nilai portofolio investasi melonjak drastis hingga lebih dari Rp 1,13 MILIAR!

Perhatikan lompatan antara tahun ke-20 dan tahun ke-30. Uang pokok yang Anda setorkan hanya bertambah Rp 60 juta, namun nilai portofolio Anda bertambah lebih dari Rp 750 juta! Inilah wujud nyata kekuatan eksponensial dari bunga majemuk.

## Tiga Kunci Sukses Memanfaatkan Compounding Interest

Agar keajaiban bunga majemuk bekerja maksimal bagi masa depan Anda, ada tiga faktor penentu yang wajib diperhatikan:

- 1. Waktu adalah Sahabat Terbaik: Semakin awal Anda memulai, semakin curam kurva pertumbuhan eksponensial Anda. Menunda investasi 5 tahun saja bisa mengurangi miliaran rupiah dari total hasil akhir di masa pensiun.
- 2. Konsistensi (Disiplin Rutin): Jangan menunggu memiliki uang dalam jumlah besar untuk berinvestasi. Jadikan investasi sebagai pos pengeluaran prioritas begitu menerima penghasilan bulanan.
- 3. Jangan Ganggu Saldo yang Bertumbuh: Godaan terbesar dari compounding interest adalah mencairkan keuntungan lebih awal untuk konsumsi sesaat. Biarkan modal dan dividen Anda terus berputar di dalam portofolio.

Dengan memahami cara kerja uang dan membiasakan diri mengelola keuangan secara adil serta terencana bersama FairShare, Anda sedang meletakkan pondasi finansial yang kokoh untuk masa depan yang merdeka secara finansial.`,
        seo_title: "Memahami Compounding Interest | Keajaiban Bunga Majemuk & Simulasi Kekayaan",
        seo_description: "Penjelasan lengkap konsep compounding interest (bunga majemuk), simulasi investasi 10 hingga 30 tahun, dan tips memaksimalkannya sejak dini.",
        canonical_url: "https://fairshare.copilotmarketing.id/blog/penjelasan-compounding-interest-bunga-berbunga",
      },
    ];

    for (const art of defaultArticles) {
      await db.execute(sql`
        INSERT INTO articles (
          id, title, slug, summary, content, featured_image, status, seo_title, seo_description, canonical_url, is_noindex, published_at
        )
        VALUES (
          gen_random_uuid(),
          ${art.title},
          ${art.slug},
          ${art.summary},
          ${art.content},
          ${art.featured_image},
          'published',
          ${art.seo_title},
          ${art.seo_description},
          ${art.canonical_url},
          false,
          now()
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          content = EXCLUDED.content,
          featured_image = EXCLUDED.featured_image,
          status = 'published',
          seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description,
          canonical_url = EXCLUDED.canonical_url,
          is_noindex = false;
      `);
    }

    isSchemaEnsured = true;
    console.log("✓ Database schema, admin user, CMS pages, and default blog articles verified successfully");
  } catch (err) {
    console.error("Failed to auto-migrate database schema:", err);
    throw err;
  }
}
