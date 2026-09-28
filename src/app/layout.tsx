import type { Metadata, Viewport } from "next";
import { Fredoka, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./fair-share.css";
import { getBaseUrl } from "../lib/site-url";
import { getSiteSettings } from "../server/queries";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#b7e913",
};

const DEFAULT_TITLE = "FairShare — Aplikasi Patungan & Pelunasan Cerdas";
const DEFAULT_DESCRIPTION =
  "Hitung jatah patungan, saldo anggota, rekomendasi transfer pelunasan, checklist lunas, dan salin rekap siap kirim ke WhatsApp.";

/**
 * Site-wide metadata is driven by the `site_settings` row so the Admin → SEO
 * screen actually controls the site. `title.template` appends the brand suffix
 * to every page title, so page-level metadata must NOT repeat it — pages whose
 * title already carries the brand (CMS/SEO fields) opt out with
 * `title: { absolute: ... }`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.siteName || "FairShare";
  const description = settings.defaultDescription || DEFAULT_DESCRIPTION;
  const ogImage = settings.defaultOgImage || "/assets/img/fair-share-cover.webp";
  const titleTemplate =
    settings.titleTemplate && settings.titleTemplate.includes("%s")
      ? settings.titleTemplate
      : `%s | ${siteName}`;

  return {
    metadataBase: new URL(getBaseUrl()),
    title: {
      default: DEFAULT_TITLE,
      template: titleTemplate,
    },
    description,
    keywords: [
      "aplikasi patungan",
      "split bill",
      "patungan trip",
      "pelunasan patungan",
      "kalkulator patungan",
      "rekap whatsapp patungan",
    ],
    authors: [{ name: `${siteName} Team` }],
    creator: siteName,
    openGraph: {
      title: DEFAULT_TITLE,
      description,
      url: getBaseUrl(),
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 605,
          alt: DEFAULT_TITLE,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fredoka.variable} ${jetbrainsMono.variable} h-full`}>
      {/* No external font <link>: `next/font` self-hosts Fredoka and
          JetBrains Mono and injects its own preloads. The previous manual
          Google Fonts stylesheet was render-blocking and downloaded Fredoka a
          second time from a third-party origin. */}
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
