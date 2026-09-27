import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { StandardPageView } from "../../components/StandardPageView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("terms");
  const settings = await getSiteSettings();
  const title = page?.seoTitle || `Syarat & Ketentuan | ${settings.siteName}`;
  const description = page?.seoDescription || "Syarat dan ketentuan pemakaian platform patungan FairShare.";
  const ogImageUrl = page?.ogImage || settings.defaultOgImage || "/assets/img/fair-share-cover.webp";

  return {
    title,
    description,
    alternates: {
      canonical: page?.canonicalUrl || "/terms",
    },
    robots: {
      index: !page?.isNoindex,
      follow: !page?.isNoindex,
    },
    openGraph: {
      title,
      description,
      url: "https://app-fairshare.vercel.app/terms",
      siteName: settings.siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function TermsPage() {
  const page = await getSitePageByKey("terms");

  const fallback = {
    key: "terms",
    name: "Syarat & Ketentuan",
    title: "Syarat & Ketentuan Penggunaan",
    content: `Selamat datang di FairShare. Dengan menggunakan layanan kami, Anda menyetujui ketentuan berikut.

### 1. Penggunaan Layanan
FairShare menyediakan alat bantu kalkulasi dan pencatatan pembagian biaya. Pengguna bertanggung jawab penuh atas keakuratan data pengeluaran dan nomor rekening yang dimasukkan.

### 2. Tanggung Jawab Pembayaran
FairShare bukan lembaga keuangan atau penyedia payment gateway. Transfer uang aktual dilakukan secara mandiri oleh masing-masing peserta langsung ke rekening peserta yang dituju.

### 3. Batasan Tanggung Jawab
Kami berusaha memastikan sistem perhitungan akurat dan bebas dari kesalahan algoritma, namun kami tidak bertanggung jawab atas kesepakatan pribadi atau sengketa pembayaran antar anggota grup di luar aplikasi.`,
    updatedAt: new Date(),
  };

  return <StandardPageView page={page || fallback} />;
}
