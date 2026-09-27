import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { getSessionUser } from "../../lib/auth";
import { FairShareNavbar } from "../../components/FairShareNavbar";
import { PublicFooter } from "../../components/PublicFooter";
import { WhatsAppFloatingButton } from "../../components/WhatsAppFloatingButton";
import { PublicContactForm } from "../../components/PublicContactForm";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Bot,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("contact");
  const settings = await getSiteSettings();
  const title = page?.seoTitle || `Kontak & Bantuan | ${settings.siteName}`;
  const description =
    page?.seoDescription ||
    "Hubungi tim Fair Share untuk bantuan penggunaan, kendala perhitungan, saran fitur, ataupun pertanyaan seputar integrasi bot patungan.";
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
  const user = await getSessionUser();

  const contactChannels = [
    {
      icon: MessageCircle,
      title: "Chat WhatsApp Resmi",
      badge: "Respons Cepat",
      badgeColor: "bg-emerald-100 text-emerald-950",
      desc: "Konsultasi langsung dengan tim support Fair Share setiap hari kerja.",
      actionText: "Chat WhatsApp",
      actionUrl: "https://wa.me/6281234567890?text=Halo%20FairShare,%20saya%20ingin%20bertanya%20seputar%20aplikasi",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: Mail,
      title: "Email Dukungan",
      badge: "1x24 Jam",
      badgeColor: "bg-blue-100 text-blue-950",
      desc: "Kirimkan pertanyaan, laporan teknis, atau proposal kerjasama via email.",
      actionText: "support@fairshare.id",
      actionUrl: "mailto:support@fairshare.copilotmarketing.id",
      iconBg: "bg-blue-100 text-blue-700",
    },
    {
      icon: Bot,
      title: "Bot Telegram Asisten",
      badge: "24/7 Otomatis",
      badgeColor: "bg-sky-100 text-sky-950",
      desc: "Cek rekap pengeluaran dan hitungan pelunasan langsung melalui bot Telegram AI.",
      actionText: "Buka Bot Telegram",
      actionUrl: "/dashboard/token",
      iconBg: "bg-sky-100 text-sky-700",
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      badge: "Setiap Hari",
      badgeColor: "bg-lime-100 text-lime-950",
      desc: "Senin – Minggu: 08:00 – 22:00 WIB. Pertanyaan di luar jam operasional akan dijawab esok pagi.",
      actionText: "Lihat FAQ Bantuan",
      actionUrl: "#faq-contact",
      iconBg: "bg-lime-100 text-lime-800",
    },
  ];

  const quickFaqs = [
    {
      q: "Berapa lama tim membalas pesan saya?",
      a: "Melalui WhatsApp kami merespons dalam rata-rata 10–30 menit pada jam kerja. Untuk email dan formulir pesan, balasan dikirimkan maksimal dalam 1x24 jam kerja.",
    },
    {
      q: "Bagaimana jika ada salah input angka pengeluaran pada event?",
      a: "Pembuat event dapat mengedit atau menghapus pengeluaran kapan saja melalui dashboard. Seluruh jatah saldo dan instruksi pelunasan akan dihitung ulang secara otomatis.",
    },
    {
      q: "Apakah layanan konsultasi dan tanya jawab ini berbayar?",
      a: "Sama sekali tidak berbayar. Bantuan teknis dan panduan penggunaan Fair Share 100% gratis untuk seluruh pengguna.",
    },
    {
      q: "Bagaimana cara menghubungkan bot Telegram ke akun saya?",
      a: "Anda dapat membuka menu 'Pengaturan AI & Bot' di dashboard, lalu masukkan token bot yang dibuat dari @BotFather. Panduan langkah demi langkah tersedia lengkap di sana.",
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
                Pusat Bantuan &amp; Kontak
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-center">
                <div className="my-auto h-fit max-md:text-center col-span-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3.5 py-1 text-xs font-bold text-lime-950 uppercase tracking-wider font-sans mb-4">
                    <MessageCircle className="h-3.5 w-3.5 text-lime-800" />
                    <span>Dukungan Responsif &amp; Ramah</span>
                  </div>

                  <h1 className="mb-6 text-4xl sm:text-5xl font-medium max-md:text-3xl tracking-tight leading-tight">
                    Kami Selalu Siap
                    <br className="max-md:hidden" />
                    {" "}Membantu{" "}
                    <span className="text-blue-500">#PatunganAnda</span>
                  </h1>

                  <p className="text-gray-500 md:text-xl mb-8 leading-relaxed max-w-xl">
                    Punya pertanyaan seputar pembagian tagihan, kendala perhitungan, saran fitur, atau integrasi bot? Tim Fair Share siap membantu Anda.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <a
                      href="https://wa.me/6281234567890?text=Halo%20FairShare,%20saya%20butuh%20bantuan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-lg primary group inline-flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Chat WhatsApp Cepat</span>
                    </a>
                    <Link href="/about" className="btn btn-lg accent">
                      Kenali Fair Share
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center md:justify-end">
                  <Image
                    src="/assets/img/meong-maskot-4.webp"
                    alt="Kontak Fair Share"
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

      {/* Contact Channels Grid */}
      <section className="py-12 bg-gray-50/80 border-y border-slate-100">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-3">
              Pilih Saluran Komunikasi Favorit Anda
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Tersedia beragam opsi bantuan yang nyaman sesuai kebutuhan dan waktu Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {contactChannels.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${item.iconBg}`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase font-sans ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <a
                      href={item.actionUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Interactive Contact Form Section */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-4xl px-4 mx-auto">
          <PublicContactForm />
        </div>
      </section>

      {/* Quick FAQ Section */}
      <section id="faq-contact" className="py-12 md:py-20 bg-gradient-to-b from-blue-50/50 rounded-t-3xl md:rounded-t-[50px]">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-950 uppercase tracking-wider font-sans mb-3">
              <HelpCircle className="h-3.5 w-3.5 text-blue-800" />
              <span>Bantuan Cepat</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-3">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Temukan jawaban cepat sebelum mengirimkan pesan atau menghubungi tim support kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
              >
                <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-2 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/register" className="btn btn-lg primary inline-flex items-center gap-2">
              <span>Mulai Buat Event Patungan Sekarang</span>
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
