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
      INSERT INTO site_settings (id, key, site_name, default_description, title_template)
      VALUES (
        gen_random_uuid(),
        'global',
        'FairShare',
        'Aplikasi kalkulator patungan dan pelunasan pengeluaran trip cerdas tanpa selisih Rp 1 pun.',
        '%s | FairShare'
      )
      ON CONFLICT (key) DO NOTHING;
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
- **WhatsApp Support**: +62 812-3456-7890
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

    isSchemaEnsured = true;
    console.log("✓ Database schema, admin user, and default CMS pages verified successfully");
  } catch (err) {
    console.error("Failed to auto-migrate database schema:", err);
    throw err;
  }
}
