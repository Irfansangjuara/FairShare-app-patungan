import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { StandardPageView } from "../../components/StandardPageView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("about");
  const settings = await getSiteSettings();

  return {
    title: page?.seoTitle || `Tentang Kami | ${settings.siteName}`,
    description: page?.seoDescription || "Tentang platform patungan cerdas FairShare.",
    alternates: {
      canonical: page?.canonicalUrl || "/about",
    },
    robots: {
      index: !page?.isNoindex,
      follow: !page?.isNoindex,
    },
  };
}

export default async function AboutPage() {
  const page = await getSitePageByKey("about");

  const fallback = {
    key: "about",
    name: "Tentang Kami",
    title: "Tentang FairShare",
    content: `FairShare adalah platform pintar yang dirancang untuk menyederhanakan perhitungan patungan dan pelunasan pengeluaran bersama.

Baik itu liburan bersama sahabat, traveling keluarga, kepanitiaan kantor, maupun makan bareng rekan kerja, FairShare menghilangkan kerumitan spreadsheet dan rumus manual yang membingungkan.

### Visi Kami
Menciptakan transparansi dan keadilan finansial dalam setiap kegiatan bersama dengan perhitungan matematika presisi integer rupiah, rute transfer pelunasan tersingkat, dan integrasi cerdas AI.`,
    updatedAt: new Date(),
  };

  return <StandardPageView page={page || fallback} />;
}
