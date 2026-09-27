import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { StandardPageView } from "../../components/StandardPageView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("contact");
  const settings = await getSiteSettings();

  return {
    title: page?.seoTitle || `Kontak & Bantuan | ${settings.siteName}`,
    description: page?.seoDescription || "Hubungi tim FairShare untuk bantuan, saran fitur, dan konsultasi.",
    alternates: {
      canonical: page?.canonicalUrl || "/contact",
    },
    robots: {
      index: !page?.isNoindex,
      follow: !page?.isNoindex,
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
