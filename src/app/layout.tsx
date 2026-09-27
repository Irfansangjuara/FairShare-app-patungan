import type { Metadata, Viewport } from "next";
import { Fredoka, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./fair-share.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://app-fairshare.vercel.app"),
  title: {
    default: "FairShare — Aplikasi Patungan & Pelunasan Cerdas",
    template: "%s | FairShare",
  },
  description:
    "Hitung jatah patungan, saldo anggota, rekomendasi transfer pelunasan, checklist lunas, dan salin rekap siap kirim ke WhatsApp.",
  keywords: [
    "aplikasi patungan",
    "split bill",
    "patungan trip",
    "pelunasan patungan",
    "kalkulator patungan",
    "rekap whatsapp patungan",
  ],
  authors: [{ name: "FairShare Team" }],
  creator: "FairShare",
  openGraph: {
    title: "FairShare — Aplikasi Patungan & Pelunasan Cerdas",
    description:
      "Hitung jatah patungan, saldo anggota, rekomendasi transfer pelunasan, checklist lunas, dan salin rekap siap kirim ke WhatsApp.",
    url: "https://app-fairshare.vercel.app",
    siteName: "FairShare",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FairShare — Aplikasi Patungan & Pelunasan Cerdas",
    description:
      "Hitung jatah patungan, saldo anggota, dan rekomendasi transfer pelunasan otomatis.",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fredoka.variable} ${jetbrainsMono.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
