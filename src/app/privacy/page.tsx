import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { getSessionUser } from "../../lib/auth";
import { FairShareNavbar } from "../../components/FairShareNavbar";
import { PublicFooter } from "../../components/PublicFooter";
import { WhatsAppFloatingButton } from "../../components/WhatsAppFloatingButton";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  KeyRound,
  FileCheck2,
  UserCheck,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("privacy");
  const settings = await getSiteSettings();
  const title = page?.seoTitle || `Kebijakan Privasi | ${settings.siteName}`;
  const description =
    page?.seoDescription ||
    "Pelajari komitmen Fair Share dalam melindungi data pribadi, enkripsi token bot Telegram, dan kerahasiaan catatan pengeluaran patungan Anda.";
  const ogImageUrl = page?.ogImage || settings.defaultOgImage || "/assets/img/fair-share-cover.webp";

  return {
    title,
    description,
    alternates: {
      canonical: page?.canonicalUrl || "/privacy",
    },
    robots: {
      index: !page?.isNoindex,
      follow: !page?.isNoindex,
    },
    openGraph: {
      title,
      description,
      url: "https://app-fairshare.vercel.app/privacy",
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

export default async function PrivacyPage() {
  const user = await getSessionUser();

  const privacyHighlights = [
    {
      icon: Database,
      title: "Data Minimalis & Esensial",
      desc: "Hanya mengumpulkan data yang mutlak diperlukan untuk kalkulasi patungan (nama peserta, judul pengeluaran, dan nominal rupiah).",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      icon: Lock,
      title: "Enkripsi Token & Kredensial",
      desc: "Token bot Telegram dan API Key AI Anda dienkripsi, disimpan secara terproteksi, dan otomatis disamarkan di tampilan antarmuka.",
      color: "bg-blue-100 text-blue-800",
    },
    {
      icon: EyeOff,
      title: "Tanpa Penjualan Data Finansial",
      desc: "Riwayat pengeluaran dan catatan transfer pelunasan grup Anda tidak pernah diperjualbelikan kepada broker data atau pengiklan pihak ketiga.",
      color: "bg-purple-100 text-purple-800",
    },
    {
      icon: UserCheck,
      title: "Kendali Penuh di Tangan Anda",
      desc: "Anda bebas mengedit data event, mencabut API token seketika, atau meminta penghapusan akun beserta riwayat patungan kapan saja.",
      color: "bg-lime-100 text-lime-900",
    },
  ];

  const sections = [
    {
      num: "01",
      title: "Informasi yang Kami Kumpulkan",
      content: [
        "Informasi Akun: Nama, alamat email, dan ID akun saat Anda mendaftar secara langsung atau melalui Google OAuth.",
        "Informasi Event & Patungan: Judul event, tanggal, lokasi opsional, nama anggota peserta, nomor rekening opsional untuk mempermudah transfer pelunasan, serta rincian transaksi pengeluaran grup.",
        "Kredensial Integrasi: Token Bot Telegram dan API Key model AI yang Anda masukkan sendiri untuk menjalankan asisten otomasi.",
        "Data Teknis & Log: Alamat IP sementara, waktu akses, dan agen peramban untuk keperluan diagnosa keamanan dan proteksi rate limiting.",
      ],
    },
    {
      num: "02",
      title: "Cara Kami Menggunakan Informasi Anda",
      content: [
        "Menjalankan algoritma pembagian bilangan bulat Rupiah tanpa sisa (deterministic remainder rounding) untuk menghasilkan rekomendasi pelunasan transfer yang adil.",
        "Menghubungkan asisten cerdas melalui webhook resmi Telegram sehingga Anda dapat meminta rekap via chat atau voice note.",
        "Menampilkan ringkasan visual saldo dan link publik (share token) agar anggota rombongan dapat memeriksa rincian tanpa harus login.",
        "Mencegah tindakan penyalahgunaan, eksploitasi API tanpa izin, dan aktivitas mencurigakan pada sistem.",
      ],
    },
    {
      num: "03",
      title: "Penyimpanan dan Keamanan Data",
      content: [
        "Seluruh data disimpan pada infrastruktur cloud berstandar industri dengan enkripsi data saat transit (TLS/HTTPS) dan data saat diam (at rest).",
        "Kredensial API token agent di-hash menggunakan algoritma SHA-256 yang aman, sehingga secret mentah tidak tersimpan dalam bentuk teks biasa.",
        "Session otentikasi login dikelola dengan cookie HttpOnly dan SameSite=Lax untuk menangkal risiko serangan XSS dan CSRF.",
      ],
    },
    {
      num: "04",
      title: "Pembagian Informasi dengan Pihak Ketiga",
      content: [
        "Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak manapun.",
        "Data hanya diteruskan kepada penyedia infrastruktur terpercaya (seperti PostgreSQL Database Provider dan Provider AI seperti DeepSeek/Anthropic/Google sesuai konfigurasi yang Anda pilih sendiri).",
        "Halaman rekap yang dibagikan via 'Share Link' hanya dapat diakses oleh pihak yang memegang tautan token unik dari pembuat event.",
      ],
    },
    {
      num: "05",
      title: "Hak Pengguna atas Data Pribadi",
      content: [
        "Hak Akses & Koreksi: Anda dapat meninjau dan memperbarui informasi akun atau event Anda kapan saja melalui dashboard.",
        "Hak Rotasi & Pencabutan Kredensial: Anda dapat merotasi atau mencabut API token Telegram dalam hitungan detik melalui menu Token Akses.",
        "Hak Penghapusan: Anda berhak mengajukan permohonan penghapusan menyeluruh atas akun dan riwayat event dengan menghubungi tim support kami.",
      ],
    },
    {
      num: "06",
      title: "Pembaruan Kebijakan Privasi",
      content: [
        "Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk menyesuaikan perkembangan regulasi atau fitur baru.",
        "Setiap pembaruan signifikan akan diumumkan melalui dashboard atau tanggal pembaruan di bagian atas dokumen ini.",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Floating Header */}
      <FairShareNavbar user={user} />

      {/* Hero Section */}
      <section className="relative py-8 bg-gradient-to-t from-white md:py-16 overflow-hidden">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="items-center justify-between gap-4 md:flex">
            <div className="mb-8 w-full">
              <div className="mb-8 text-4xl font-medium text-center md:mb-16 max-md:text-2xl text-gray-700">
                Kebijakan Privasi
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-center">
                <div className="my-auto h-fit max-md:text-center col-span-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-950 uppercase tracking-wider font-sans mb-4">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-800" />
                    <span>Keamanan &amp; Perlindungan Data</span>
                  </div>

                  <h1 className="mb-6 text-4xl sm:text-5xl font-medium max-md:text-3xl tracking-tight leading-tight">
                    Privasi Anda Adalah
                    <br className="max-md:hidden" />
                    {" "}Komitmen Utama{" "}
                    <span className="text-blue-500">#FairShare</span>
                  </h1>

                  <p className="text-gray-500 md:text-xl mb-8 leading-relaxed max-w-xl">
                    Ketahui secara transparan bagaimana kami mengumpulkan, mengamankan, dan memperlakukan data pengeluaran patungan grup Anda tanpa kompromi.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <Link href="/terms" className="btn btn-lg primary inline-flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4" />
                      <span>Baca Syarat &amp; Ketentuan</span>
                    </Link>
                    <Link href="/contact" className="btn btn-lg accent">
                      Pusat Bantuan
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center md:justify-end">
                  <Image
                    src="/assets/img/meong-maskot-5.webp"
                    alt="Privasi Fair Share"
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

      {/* 4 Privacy Highlights Cards */}
      <section className="py-12 bg-gray-50/80 border-y border-slate-100">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-3">
              Prinsip Privasi yang Kami Pegang Teguh
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Fair Share dirancang sejak awal dengan prinsip privasi berbasis kebutuhan nyata pengguna.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {privacyHighlights.map((item, idx) => {
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
              Versi 2.4 (Aktif)
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

          {/* Contact Box */}
          <div className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-slate-900 text-base">
                Punya Pertanyaan Spesifik Terkait Privasi Anda?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Petugas perlindungan data kami siap menjawab seluruh pertanyaan Anda secara terbuka.
              </p>
            </div>

            <Link
              href="/contact"
              className="btn btn-lg primary shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <span>Hubungi Tim Privasi</span>
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
