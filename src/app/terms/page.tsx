import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { FairShareNavbar } from "../../components/FairShareNavbar";
import { PublicFooter } from "../../components/PublicFooter";
import { WhatsAppFloatingButton } from "../../components/WhatsAppFloatingButton";
import { absoluteUrl } from "../../lib/site-url";
import {
  FileText,
  Scale,
  ShieldAlert,
  WalletCards,
  CheckCircle2,
  Calendar,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Award,
} from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("terms");
  const settings = await getSiteSettings();
  const title = page?.seoTitle || "Syarat & Ketentuan";
  const description =
    page?.seoDescription ||
    "Syarat dan ketentuan pemakaian platform patungan Fair Share untuk menjamin transparansi, ketepatan perhitungan, dan kesepahaman seluruh pengguna.";
  const ogImageUrl = page?.ogImage || settings.defaultOgImage || "/assets/img/fair-share-cover.webp";

  return {
    title: page?.seoTitle ? { absolute: page.seoTitle } : title,
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
      url: absoluteUrl("/terms"),
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
  const termsHighlights = [
    {
      icon: Scale,
      title: "Hitungan Adil Tanpa Selisih",
      desc: "Perhitungan pembagian tagihan menggunakan algoritma bilangan bulat Rupiah tanpa pembulatan yang merugikan salah satu anggota.",
      color: "bg-lime-100 text-lime-900",
    },
    {
      icon: WalletCards,
      title: "Transfer Peer-to-Peer Langsung",
      desc: "Fair Share adalah alat kalkulasi. Pembayaran ditransfer langsung antar-rekening peserta tanpa perantara dan tanpa potongan biaya sepeserpun.",
      color: "bg-lime-100 text-lime-900",
    },
    {
      icon: Award,
      title: "Transparansi Penuh untuk Semua",
      desc: "Semua anggota dapat memeriksa siapa membayar apa, rekap saldo neto, dan status lunas melalui tautan rekap publik (share token).",
      color: "bg-lime-100 text-lime-900",
    },
    {
      icon: ShieldAlert,
      title: "Keamanan Akun & Kredensial",
      desc: "Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi, token bot Telegram, dan hak akses API yang dibuat.",
      color: "bg-lime-100 text-lime-900",
    },
  ];

  const sections = [
    {
      num: "01",
      title: "Penerimaan Ketentuan",
      content: [
        "Dengan mengakses, mendaftar, atau menggunakan platform Fair Share, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan layanan ini.",
        "Jika Anda tidak menyetujui salah satu pasal, Anda dipersilakan untuk tidak melanjutkan penggunaan platform ini.",
      ],
    },
    {
      num: "02",
      title: "Karakteristik & Peran Platform Fair Share",
      content: [
        "Fair Share berperan murni sebagai perangkat lunak pencatat pengeluaran grup, penghitung jatah, dan penyusun rekomendasi transfer pelunasan otomatis.",
        "Fair Share BUKAN lembaga perbankan, dompet digital (e-wallet), atau penyelenggara jasa pembayaran (PJP). Kami tidak pernah mengumpulkan, menyimpan, atau menahan dana pengguna.",
        "Setiap pembayaran atau transfer pelunasan dilakukan secara langsung (peer-to-peer) antar-rekening bank atau e-wallet milik masing-masing anggota rombongan.",
      ],
    },
    {
      num: "03",
      title: "Kewajiban dan Tanggung Jawab Pengguna",
      content: [
        "Pengguna bertanggung jawab memastikan kebenaran data pengeluaran, nama peserta, dan nominal yang dimasukkan ke dalam event.",
        "Pengguna bertanggung jawab menjaga keamanan kredensial akun, password, dan API Bearer Token yang dihasilkan dari dashboard.",
        "Dilarang menggunakan layanan untuk aktivitas ilegal, penipuan finansial, atau manipulasi catatan tagihan yang disengaja untuk merugikan pihak lain.",
      ],
    },
    {
      num: "04",
      title: "Ketepatan Algoritma Perhitungan",
      content: [
        "Algoritma Fair Share menjamin bahwa total uang yang ditransfer oleh anggota berstatus 'membayar' akan tepat sama hingga Rp 1 dengan total uang yang diterima oleh anggota berstatus 'menerima'.",
        "Sisa pembagian Rupiah yang tidak habis dibagi (misal Rp 100.000 dibagi 3 orang) dialokasikan secara deterministik berbasis urutan waktu keikutsertaan anggota.",
      ],
    },
    {
      num: "05",
      title: "Kebijakan API & Integrasi Otomasi (Bot Telegram)",
      content: [
        "Fair Share menyediakan endpoint API untuk integrasi bot Telegram dan agent AI pihak ketiga.",
        "Pengguna dilarang melakukan spamming request, scraping agresif, atau serangan Denial of Service (DoS) yang melebihi batas rate-limit yang ditetapkan (120 req/menit).",
        "Kami berhak mencabut token akses yang terindikasi melakukan penyalahgunaan atau pelanggaran keamanan.",
      ],
    },
    {
      num: "06",
      title: "Batasan Tanggung Jawab & Hukum yang Berlaku",
      content: [
        "Fair Share tidak bertanggung jawab atas perselisihan pribadi atau kegagalan transfer uang nyata antar-anggota grup di luar platform.",
        "Syarat dan ketentuan ini diatur dan ditafsirkan berdasarkan hukum Negara Republik Indonesia.",
        "Pembaruan syarat dan ketentuan akan diberitahukan melalui situs web atau dashboard sebelum diberlakukan.",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Floating Header */}
      <FairShareNavbar />

      {/* Hero Section */}
      <section className="relative py-8 bg-gradient-to-t from-white md:py-16 overflow-hidden">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="items-center justify-between gap-4 md:flex">
            <div className="mb-8 w-full">
              <div className="mb-8 text-4xl font-medium text-center md:mb-16 max-md:text-2xl text-gray-700">
                Ketentuan Layanan
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-center">
                <div className="my-auto h-fit max-md:text-center col-span-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3.5 py-1 text-xs font-bold text-lime-950 uppercase tracking-wider font-sans mb-4">
                    <Scale className="h-3.5 w-3.5 text-lime-800" />
                    <span>Transparansi &amp; Aturan Main Adil</span>
                  </div>

                  <h1 className="mb-6 text-4xl sm:text-5xl font-medium max-md:text-3xl tracking-tight leading-tight">
                    Syarat &amp; Ketentuan
                    <br className="max-md:hidden" />
                    {" "}Penggunaan{" "}
                    <span className="text-blue-500">#FairShare</span>
                  </h1>

                  <p className="text-gray-500 md:text-xl mb-8 leading-relaxed max-w-xl">
                    Panduan dan komitmen bersama untuk menjaga perhitungan patungan tetap adil, transparan, dan bebas drama bagi seluruh pengguna.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <Link href="/privacy" className="btn btn-lg primary inline-flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Kebijakan Privasi</span>
                    </Link>
                    <Link href="/about" className="btn btn-lg accent">
                      Kenali Fair Share
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center md:justify-end">
                  <Image
                    src="/assets/img/meong-maskot-6.webp"
                    alt="Ketentuan Layanan Fair Share"
                    width={350}
                    height={380}
                    priority
                    className="mx-auto md:mr-0 max-md:max-w-56 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 w-full h-full mx-auto overflow-hidden -z-10">
            <img
              className="absolute left-0 right-0 mx-auto animate-slow-cloud"
              src="/assets/img/fair-share-cloud2.svg"
              alt=""
            />
          </div>
        </div>
      </section>

      {/* 4 Terms Highlights Cards */}
      <section className="py-12 bg-gray-50/80 border-y border-slate-100">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-3">
              Pilar Ketentuan Layanan Kami
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Prinsip keadilan dan transparansi yang menjamin kenyamanan patungan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {termsHighlights.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${item.color}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Legal Sections */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-4xl px-4 mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Terakhir diperbarui: 28 September 2026</span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Versi 1.8 (Aktif)
            </span>
          </div>

          <div className="space-y-6">
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-sm font-black font-mono text-[#b7e913] bg-slate-950 px-2.5 py-1 rounded-xl shrink-0">
                    {sec.num}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight pt-0.5">
                    {sec.title}
                  </h3>
                </div>

                <ul className="space-y-2.5 pl-2 sm:pl-12 text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {sec.content.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Help Banner */}
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-white text-base sm:text-lg">
                Siap Bereskan Patungan Liburan &amp; Hangout?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300">
                Buat event gratis sekarang dan nikmati kemudahan hitung jatah tanpa drama.
              </p>
            </div>

            <Link
              href="/register"
              className="btn-pill-lime text-xs sm:text-sm py-3 px-7 font-bold shrink-0 inline-flex items-center gap-2 shadow-md"
            >
              <span>Daftar Gratis Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />

      {/* Floating WhatsApp Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}
