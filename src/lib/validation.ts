import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

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
});

export const expenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Deskripsi pengeluaran wajib diisi")
    .max(160, "Deskripsi maksimal 160 karakter"),
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
