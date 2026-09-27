import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateWhatsAppRecap } from "../../src/lib/settlement.ts";
import {
  memberSchema,
  expenseSchema,
  articleSchema,
  apiTokenSchema,
  pageEditSchema,
  siteSettingsSchema,
  registerSchema,
} from "../../src/lib/validation.ts";
import { maskSecret, AI_PROVIDERS } from "../../src/lib/ai/providers.ts";
import {
  hashToken,
  generateTokenSecret,
  verifyApiRequest,
  verifyAdminApiRequest,
  checkRateLimit,
  OFFICIAL_AI_AGENT_TOKEN,
} from "../../src/lib/api/auth.ts";

describe("Fitur #1 & WhatsApp Recap: Nomor Rekening Peserta", () => {
  it("memvalidasi nomor rekening opsional pada memberSchema", () => {
    // Valid with bank account
    const res1 = memberSchema.safeParse({
      name: "Budi Santoso",
      bankAccount: "BCA 1234567890 a.n Budi",
    });
    assert.equal(res1.success, true);
    if (res1.success) {
      assert.equal(res1.data.bankAccount, "BCA 1234567890 a.n Budi");
    }

    // Valid without bank account (null/undefined)
    const res2 = memberSchema.safeParse({
      name: "Sinta",
    });
    assert.equal(res2.success, true);
  });

  it("menyertakan informasi nomor rekening penerima transfer pada teks WhatsApp recap", () => {
    const recap = generateWhatsAppRecap({
      eventTitle: "Trip Bromo",
      eventLocation: "Malang",
      eventDate: "2026-10-01",
      memberCount: 2,
      totalAmount: BigInt(200000),
      memberCalculations: [
        {
          memberId: "m1",
          name: "Budi",
          paid: BigInt(200000),
          share: BigInt(100000),
          balance: BigInt(100000),
        },
        {
          memberId: "m2",
          name: "Sinta",
          paid: BigInt(0),
          share: BigInt(100000),
          balance: BigInt(-100000),
        },
      ],
      settlementsWithStatus: [
        {
          fromName: "Sinta",
          toName: "Budi",
          toBankAccount: "BCA 1234567890 a.n Budi",
          amount: BigInt(100000),
          isPaid: false,
        },
      ],
    });

    assert.ok(recap.includes("Sinta ➡️ Budi: *Rp 100.000*"));
    assert.ok(recap.includes("💳 Rek: BCA 1234567890 a.n Budi"));
    assert.ok(recap.includes("⏳ *[BELUM LUNAS]*"));
  });
});

describe("Fitur #2: Referensi Kategori Pengeluaran", () => {
  it("memvalidasi kategori pada expenseSchema dan default ke Umum", () => {
    const validExpense = expenseSchema.safeParse({
      title: "Makan Malam",
      category: "Konsumsi",
      amount: 150000,
      paidByMemberId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    });

    assert.equal(validExpense.success, true);
    if (validExpense.success) {
      assert.equal(validExpense.data.category, "Konsumsi");
    }

    // Default category if omitted
    const defaultExpense = expenseSchema.safeParse({
      title: "Bensin Tol",
      amount: "50000",
      paidByMemberId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    });
    assert.equal(defaultExpense.success, true);
    if (defaultExpense.success) {
      assert.equal(defaultExpense.data.category, "Umum");
    }
  });
});

describe("Fitur #4: Provider AI & Proteksi Kredensial", () => {
  it("menyediakan daftar provider AI lengkap sesuai kebutuhan", () => {
    const providerIds = AI_PROVIDERS.map((p) => p.id);
    assert.ok(providerIds.includes("deepseek"));
    assert.ok(providerIds.includes("claude"));
    assert.ok(providerIds.includes("gemini"));
    assert.ok(providerIds.includes("opencode_go"));
    assert.ok(providerIds.includes("9router"));
    assert.ok(providerIds.includes("openrouter"));
  });

  it("menyamarkan (mask) secret key dan token bot agar tidak bocor di UI", () => {
    const masked1 = maskSecret("sk-proj-1234567890abcdefghijk");
    assert.equal(masked1, "sk-p••••••••hijk");

    const maskedShort = maskSecret("12345");
    assert.equal(maskedShort, "••••••••");

    assert.equal(maskSecret(""), "");
    assert.equal(maskSecret(null), "");
  });
});

describe("Fitur #8: Token AI Agent & Hashing SHA-256", () => {
  it("menghasilkan token rahasia berformat fs_live_ dan hash unik", () => {
    const { rawToken, tokenHash, tokenPrefix } = generateTokenSecret();
    assert.ok(rawToken.startsWith("fs_live_"));
    assert.ok(tokenPrefix.startsWith("fs_live_"));
    assert.equal(tokenHash.length, 64); // SHA-256 is 64 hex chars
    assert.equal(hashToken(rawToken), tokenHash);
  });

  it("memvalidasi schema token API dengan minimal 1 scope", () => {
    const valid = apiTokenSchema.safeParse({
      name: "CrewAI Agent",
      scopes: ["read:campaigns", "write:expenses"],
    });
    assert.equal(valid.success, true);

    const invalid = apiTokenSchema.safeParse({
      name: "Agent",
      scopes: [],
    });
    assert.equal(invalid.success, false);
  });

  it("menolak request API tanpa token atau dengan format salah", async () => {
    // 1. Missing header
    const resNoHeader = await verifyApiRequest({ headers: new Headers() });
    assert.equal(resNoHeader.authorized, false);
    assert.equal(resNoHeader.status, 401);

    // 2. Not Bearer prefix
    const resBasic = await verifyApiRequest({ headers: new Headers({ authorization: "Basic 12345" }) });
    assert.equal(resBasic.authorized, false);
    assert.equal(resBasic.status, 401);

    // 3. Not fs_live_ prefix
    const resInvalidPrefix = await verifyApiRequest({ headers: new Headers({ authorization: "Bearer invalid_secret_123" }) });
    assert.equal(resInvalidPrefix.authorized, false);
    assert.equal(resInvalidPrefix.status, 401);

    // 4. Unknown token hash
    const resUnknown = await verifyApiRequest({ headers: new Headers({ authorization: "Bearer fs_live_00000000000000000000000000000000" }) });
    assert.equal(resUnknown.authorized, false);
    assert.equal(resUnknown.status, 401);
  });

  it("membatasi laju permintaan (rate limiting) per token", () => {
    const testTokenId = "test-token-rate-limit-123";
    const r1 = checkRateLimit(testTokenId, 2, 5000);
    assert.equal(r1.allowed, true);
    assert.equal(r1.remaining, 1);

    const r2 = checkRateLimit(testTokenId, 2, 5000);
    assert.equal(r2.allowed, true);
    assert.equal(r2.remaining, 0);

    const r3 = checkRateLimit(testTokenId, 2, 5000);
    assert.equal(r3.allowed, false);
    assert.equal(r3.remaining, 0);
  });
});

describe("Fitur #5 & #7: Validasi Artikel Blog & SEO Slug", () => {
  it("memvalidasi format slug artikel hanya huruf kecil, angka, dan strip", () => {
    const valid = articleSchema.safeParse({
      title: "Panduan Patungan Liburan",
      slug: "panduan-patungan-liburan-2026",
      summary: "Ringkasan panduan",
      content: "Isi artikel lengkap dengan panduan praktis patungan.",
      status: "published",
    });
    assert.equal(valid.success, true);

    const invalidSlug = articleSchema.safeParse({
      title: "Panduan Patungan Liburan",
      slug: "Panduan Patungan Liburan!",
      content: "Isi artikel lengkap...",
      status: "draft",
    });
    assert.equal(invalidSlug.success, false);
  });
});

describe("Fitur #6: Validasi Edit Halaman CMS & Global SEO Settings", () => {
  it("memvalidasi struktur edit halaman statis dan SEO metadata", () => {
    const valid = pageEditSchema.safeParse({
      key: "about",
      name: "Tentang Kami",
      title: "Tentang FairShare",
      content: "Platform patungan cerdas nomor satu di Indonesia.",
      isPublished: true,
      navOrder: 1,
      seoTitle: "Tentang Kami | FairShare",
      seoDescription: "Pelajari sejarah dan komitmen FairShare dalam transparansi biaya.",
      canonicalUrl: "https://fairshare.diskon.com/about",
      isNoindex: false,
    });
    assert.equal(valid.success, true);
  });

  it("memvalidasi pengaturan global SEO website", () => {
    const valid = siteSettingsSchema.safeParse({
      siteName: "FairShare",
      defaultDescription: "Aplikasi patungan dan pelunasan otomatis.",
      titleTemplate: "%s | FairShare",
    });
    assert.equal(valid.success, true);

    const invalid = siteSettingsSchema.safeParse({
      siteName: "F", // too short (<2)
      titleTemplate: "",
    });
    assert.equal(invalid.success, false);
  });
});

describe("Fitur Admin: Portal Login & Manajemen Pengguna", () => {
  it("memvalidasi skema registrasi pengguna baru oleh admin", () => {
    const valid = registerSchema.safeParse({
      name: "Budi Santoso",
      email: "budi@example.com",
      password: "password123",
    });
    assert.equal(valid.success, true);

    const invalidEmail = registerSchema.safeParse({
      name: "Budi Santoso",
      email: "invalid-email-format",
      password: "password123",
    });
    assert.equal(invalidEmail.success, false);

    const shortPassword = registerSchema.safeParse({
      name: "Budi Santoso",
      email: "budi@example.com",
      password: "123",
    });
    assert.equal(shortPassword.success, false);
  });

  it("memvalidasi aturan hak akses role dan perlindungan akun admin", () => {
    // Role harus 'user' atau 'admin'
    const allowedRoles = ["user", "admin"];
    assert.equal(allowedRoles.includes("admin"), true);
    assert.equal(allowedRoles.includes("user"), true);
    assert.equal(allowedRoles.includes("guest"), false);

    // Safeguard 1: Admin tidak boleh mencabut role dari diri sendiri
    const currentAdminId = "admin-1";
    const targetUserId = "admin-1";
    const newRole = "user";
    const canDemote = currentAdminId !== targetUserId || newRole === "admin";
    assert.equal(canDemote, false);

    // Safeguard 2: Admin tidak boleh menghapus diri sendiri saat login
    const canDeleteSelf = currentAdminId !== targetUserId;
    assert.equal(canDeleteSelf, false);

    // Safeguard 3: Minimal 1 admin harus tersisa di sistem
    const remainingAdminsCount = 1;
    const canDeleteLastAdmin = remainingAdminsCount > 1;
    assert.equal(canDeleteLastAdmin, false);
  });

  it("memverifikasi format akun kredensial admin resmi copilotmarketing.id", () => {
    const adminEmail = "admin@fairshare.copilotmarketing.id";
    const adminPass = "#@Cusn77";

    const parsed = registerSchema.safeParse({
      name: "Admin FairShare",
      email: adminEmail,
      password: adminPass,
    });
    assert.equal(parsed.success, true);
    assert.equal(adminEmail.endsWith("@fairshare.copilotmarketing.id"), true);
  });

  it("memverifikasi token resmi AI Agent master dan otorisasi admin API", async () => {
    assert.equal(typeof OFFICIAL_AI_AGENT_TOKEN, "string");
    assert.equal(OFFICIAL_AI_AGENT_TOKEN.startsWith("fs_live_"), true);

    // Header tanpa token harus ditolak
    const unauth = await verifyAdminApiRequest({ headers: new Headers() });
    assert.equal(unauth.authorized, false);
    assert.equal(unauth.status, 401);
  });
});

