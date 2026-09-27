import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
    email: z.string().trim().email("Format email tidak valid"),
    phone: z.string().optional().nullable(),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
    password_confirmation: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.password_confirmation && data.password !== data.password_confirmation) {
        return false;
      }
      return true;
    },
    {
      message: "Konfirmasi kata sandi tidak cocok",
      path: ["password_confirmation"],
    }
  );

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul event minimal 3 karakter")
    .max(120, "Judul event maksimal 120 karakter"),
  location: z.string().trim().max(160, "Lokasi maksimal 160 karakter").optional().nullable(),
  eventDate: z.string().optional().nullable(),
});

export const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama peserta wajib diisi")
    .max(80, "Nama peserta maksimal 80 karakter"),
  bankAccount: z
    .string()
    .trim()
    .max(160, "Nomor rekening maksimal 160 karakter")
    .optional()
    .nullable(),
});

export const expenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Deskripsi pengeluaran wajib diisi")
    .max(160, "Deskripsi maksimal 160 karakter"),
  category: z
    .string()
    .trim()
    .max(80, "Kategori maksimal 80 karakter")
    .optional()
    .default("Umum"),
  amount: z
    .number()
    .int("Nominal harus berupa bilangan bulat")
    .positive("Nominal harus lebih besar dari 0")
    .or(
      z
        .string()
        .regex(/^\d+$/, "Nominal harus berupa angka")
        .transform((val) => BigInt(val))
    ),
  paidByMemberId: z.string().uuid("ID pembayar tidak valid"),
});

export const articleSchema = z.object({
  title: z.string().trim().min(3, "Judul artikel minimal 3 karakter").max(255),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda minus"),
  summary: z.string().trim().max(500, "Ringkasan maksimal 500 karakter").optional().nullable(),
  content: z.string().trim().min(10, "Isi artikel minimal 10 karakter"),
  featuredImage: z.string().trim().url("URL gambar tidak valid").optional().nullable().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(255).optional().nullable(),
  seoDescription: z.string().trim().max(300).optional().nullable(),
  canonicalUrl: z.string().trim().url("URL Canonical tidak valid").optional().nullable().or(z.literal("")),
  isNoindex: z.boolean().default(false),
});

export const pageEditSchema = z.object({
  key: z.string().min(1),
  name: z.string().trim().min(2, "Nama halaman minimal 2 karakter").max(100),
  title: z.string().trim().min(3, "Judul halaman minimal 3 karakter").max(255),
  content: z.string().trim().min(5, "Konten minimal 5 karakter"),
  featuredImage: z.string().trim().url("URL gambar tidak valid").optional().nullable().or(z.literal("")),
  isPublished: z.boolean().default(true),
  navOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().trim().max(255).optional().nullable(),
  seoDescription: z.string().trim().max(300).optional().nullable(),
  canonicalUrl: z.string().trim().url("URL Canonical tidak valid").optional().nullable().or(z.literal("")),
  isNoindex: z.boolean().default(false),
  ogImage: z.string().trim().url("URL OG Image tidak valid").optional().nullable().or(z.literal("")),
  ogDescription: z.string().trim().max(300).optional().nullable(),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(2, "Nama website minimal 2 karakter").max(120),
  defaultDescription: z.string().trim().max(300).optional().nullable(),
  defaultOgImage: z.string().trim().url("URL gambar tidak valid").optional().nullable().or(z.literal("")),
  titleTemplate: z.string().trim().min(3, "Format judul harus memiliki template seperti %s | FairShare"),
});

export const apiTokenSchema = z.object({
  name: z.string().trim().min(2, "Nama token minimal 2 karakter").max(100),
  scopes: z.array(z.string()).min(1, "Pilih minimal 1 permission scope"),
});
