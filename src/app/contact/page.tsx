import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { StandardPageView } from "../../components/StandardPageView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("contact");
  const settings = await getSiteSettings();
  const title = page?.seoTitle || `Kontak & Bantuan | ${settings.siteName}`;
  const description = page?.seoDescription || "Hubungi tim FairShare untuk bantuan, saran fitur, dan konsultasi.";
  const ogImageUrl = page?.ogImage || settings.defaultOgImage || "/assets/img/fair-share-cover.webp";

  return {
    title,
    description,
    alternates: {
      canonical: page?.canonicalUrl || "/contact",
    },
    robots: {
      index: !page?.isNoindex,
      follow: !page?.isNoindex,
    },
    openGraph: {
      title,
      description,
      url: "https://app-fairshare.vercel.app/contact",
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

export default async function ContactPage() {
  const page = await getSitePageByKey("contact");

  const fallback = {
    key: "contact",
    name: "Kontak",
    title: "Hubungi Tim FairShare",
    content: `Punya pertanyaan, saran fitur, atau membutuhkan bantuan teknis? Tim kami siap mendengarkan Anda.

### Saluran Komunikasi
- **Email Dukungan**: support@copilotmarketing.id
- **WhatsApp Support**: +62 812-3456-7890
- **Jam Operasional**: Senin – Jumat, 09:00 – 17:00 WIB

Silakan tinggalkan pesan kapan saja, dan kami akan merespons dalam waktu 1x24 jam kerja.`,
    updatedAt: new Date(),
  };

  return <StandardPageView page={page || fallback} />;
}
