import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { StandardPageView } from "../../components/StandardPageView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("privacy");
  const settings = await getSiteSettings();

  return {
    title: page?.seoTitle || `Kebijakan Privasi | ${settings.siteName}`,
    description: page?.seoDescription || "Kebijakan privasi dan perlindungan data pengguna FairShare.",
    alternates: {
      canonical: page?.canonicalUrl || "/privacy",
    },
    robots: {
      index: !page?.isNoindex,
      follow: !page?.isNoindex,
    },
  };
}

export default async function PrivacyPage() {
  const page = await getSitePageByKey("privacy");

  const fallback = {
    key: "privacy",
    name: "Kebijakan Privasi",
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
    updatedAt: new Date(),
  };

  return <StandardPageView page={page || fallback} />;
}
