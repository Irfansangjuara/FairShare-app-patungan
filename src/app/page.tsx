import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getSessionUser } from "../lib/auth";
import { FairShareNavbar } from "../components/FairShareNavbar";
import { PublicFooter } from "../components/PublicFooter";
import { WhatsAppFloatingButton } from "../components/WhatsAppFloatingButton";
import SituationTestimonialSlider from "../components/SituationTestimonialSlider";
import FeatureBadgesSlider from "../components/FeatureBadgesSlider";
import { getSiteSettings } from "../server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: `${settings.siteName} | Bereskan Patungan Trip Tanpa Bingung`,
    description:
      settings.defaultDescription ||
      "Fair Share mengubah catatan pengeluaran grup yang tercecer menjadi satu jawaban pasti: siapa membayar siapa, berapa nominal rupiahnya, dan apakah sudah lunas.",
    alternates: {
      canonical: "/",
    },
  };
}

export default async function HomePage() {
  const user = await getSessionUser();

  const faqs = [
    {
      q: "Apa itu Fair Share?",
      a: "Fair Share adalah aplikasi patungan untuk mencatat pengeluaran grup, menghitung jatah dan saldo anggota, lalu memberikan rekomendasi transfer pelunasan.",
    },
    {
      q: "Apakah platform ini gratis?",
      a: "Ya. Fair Share dapat digunakan gratis tanpa biaya tersembunyi untuk membantu patungan trip, keluarga, teman kantor, maupun kepanitiaan.",
    },
    {
      q: "Bagaimana jatah patungan dihitung?",
      a: "Semua nominal dihitung menggunakan bilangan Rupiah utuh. Total pengeluaran dibagi menjadi jatah anggota secara adil dan presisi.",
    },
    {
      q: "Bagaimana jika total tidak habis dibagi?",
      a: "Sisa Rupiah dialokasikan secara deterministik kepada anggota, sehingga total pembagian selalu tepat tanpa kehilangan Rp 1 pun.",
    },
    {
      q: "Apa itu saldo anggota?",
      a: "Saldo menunjukkan selisih antara jumlah yang sudah dibayar anggota dan jatahnya. Saldo positif berarti menerima, saldo negatif berarti membayar.",
    },
    {
      q: "Bagaimana rekomendasi transfer dibuat?",
      a: "Fair Share mencocokkan anggota yang perlu membayar dengan anggota yang perlu menerima, lalu menyusun daftar transfer pelunasan yang ringkas.",
    },
    {
      q: "Apakah status pelunasan tersimpan?",
      a: "Ya. Tandai transfer yang sudah lunas dan statusnya tetap tersimpan saat halaman dimuat ulang.",
    },
    {
      q: "Bisa kirim rekap ke WhatsApp?",
      a: "Bisa. Satu tombol menyalin rekap rapi berisi jatah, saldo, dan transfer agar siap ditempel ke grup WhatsApp.",
    },
    {
      q: "Siapa yang cocok memakai Fair Share?",
      a: "Fair Share cocok untuk trip teman kantor, liburan keluarga, acara komunitas, kepanitiaan, dan kebutuhan patungan grup lainnya.",
    },
    {
      q: "Apakah masih perlu spreadsheet?",
      a: "Tidak. Cukup buat event, tambahkan anggota, dan catat pengeluaran. Fair Share menghitung jatah, saldo, dan pelunasan otomatis.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Floating Header */}
      <FairShareNavbar user={user} />

      {/* Hero Section */}
      <section className="relative isolate pt-6 md:pt-10">
        <div className="px-4 pt-12 md:pt-20 mx-auto max-w-6xl text-center relative z-10">
          <h1 className="mb-8 text-4xl font-medium md:text-7xl lg:text-7xl max-w-[28ch] mx-auto tracking-tight leading-tight">
            <span className="px-3 sm:px-6 py-0.5 sm:py-1 rounded-2xl md:rounded-full bg-theme-500 inline-block my-1">
              Bereskan Patungan Trip
            </span>{" "}
            Tanpa Bingung
            <div className="inline-block relative align-middle mx-1.5 sm:mx-2.5">
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none text-center badge-text-pro">
                <span className="text-xs sm:text-sm md:text-[15px] font-black tracking-tight text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                  100%
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.14em] text-white leading-none mt-0.5 sm:mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                  GRATIS
                </span>
              </div>
              <Image
                src="/assets/img/fair-share-badge.svg"
                width={90}
                height={95}
                className="inline-block max-md:w-14 sm:w-20 md:w-[90px] h-auto animate-spin-super-slow drop-shadow-xs"
                alt="Badge 100% Gratis"
                priority
              />
            </div>
            Hitung, Lunasi &amp; Beres
          </h1>

          <p className="mx-auto max-w-xl text-lg sm:text-xl text-gray-500 mb-8 sm:mb-16 leading-relaxed">
            Fair Share mengubah catatan pengeluaran grup yang tercecer menjadi satu jawaban pasti: siapa membayar siapa, berapa nominal rupiahnya, dan apakah sudah lunas.
          </p>

          <div className="justify-around items-center sm:flex">
            <Image
              className="max-md:max-w-24 max-sm:mb-6 mx-auto max-w-[230px] w-full object-contain"
              width={230}
              height={281}
              src="/assets/img/meong-maskot-10.webp"
              alt="Maskot Fair Share 1"
              priority
            />

            <div className="flex flex-col sm:flex-row flex-none mb-8 gap-3 justify-center items-center">
              <Link href="/about" className="btn w-fit mx-auto btn-lg accent">
                Kenali Fair Share
              </Link>
              <Link
                href={user ? "/dashboard" : "/register"}
                className="btn btn-lg primary group"
              >
                {user ? "Buka Dashboard" : "Mulai Patungan Gratis"}
                <span className="has-arrow inline-flex ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </Link>
            </div>

            <Image
              className="max-w-[230px] w-full max-sm:hidden mx-auto max-md:max-w-24 object-contain"
              width={230}
              height={281}
              src="/assets/img/meong-maskot-14.webp"
              alt="Maskot Fair Share 2"
              priority
            />
          </div>
        </div>

        {/* Cloud Background Animation */}
        <div className="overflow-hidden absolute right-0 left-0 -bottom-16 md:-bottom-20 mx-auto w-full h-full pointer-events-none z-0">
          <img
            className="absolute right-0 bottom-0 left-0 mx-auto min-w-[900px] md:min-w-[1100px] w-full max-w-[1400px] md:-bottom-36 animate-slow-cloud select-none"
            src="/assets/img/fair-share-cloud.svg"
            alt="Awan Fair Share"
          />
        </div>
      </section>

      {/* Feature Badges Cards (Carousel with Auto Slider) */}
      <FeatureBadgesSlider />

      {/* Apa Itu Fair Share Section */}
      <section className="mt-8 py-12 md:py-16 rounded-t-3xl md:rounded-t-[50px] bg-gradient-to-b from-blue-50">
        <div className="px-4 mx-auto mb-8 max-w-6xl text-center md:mb-12">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
            Apa Itu Fair Share?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mx-auto max-w-5xl items-center mb-10">
          <div className="relative md:col-span-2 p-6 text-lg font-medium text-gray-600 bg-white md:bg-transparent rounded-2xl leading-relaxed">
            <span className="text-black font-semibold">Fair Share</span> adalah aplikasi patungan yang menghitung jatah, saldo anggota, dan rekomendasi transfer pelunasan secara otomatis. Semua jadi jelas tanpa spreadsheet atau hitung ulang.
          </div>
          <div className="flex justify-center md:justify-end">
            <Image
              className="object-contain"
              width={220}
              height={220}
              src="/assets/img/meong-maskot-13.webp"
              alt="Maskot Fair Share penjelasan"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 px-4 mx-auto max-w-5xl md:grid-cols-2">
          {/* Card 1 */}
          <div className="p-6 text-xl font-medium text-black bg-white rounded-2xl shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="relative shrink-0">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none text-center badge-text-pro">
                  <span className="text-xs sm:text-sm font-black tracking-tight text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                    100%
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.14em] text-white leading-none mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                    GRATIS
                  </span>
                </div>
                <Image
                  src="/assets/img/fair-share-badge.svg"
                  width={80}
                  height={85}
                  className="inline-block animate-spin-super-slow drop-shadow-xs"
                  alt="Badge 100% Gratis"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Hitung Jatah Otomatis</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Setiap anggota mendapat jatah yang adil. Semua nominal dihitung presisi dalam Rupiah tanpa kehilangan Rp 1 pun.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 text-xl font-medium text-black bg-white rounded-2xl shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="relative shrink-0">
                <span className="absolute flex justify-center items-center z-10 text-white h-full w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                    />
                  </svg>
                </span>
                <Image
                  src="/assets/img/fair-share-badge.svg"
                  width={80}
                  height={85}
                  className="inline-block animate-spin-super-slow filter hue-rotate-180"
                  alt=""
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Tanpa Spreadsheet</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tambahkan anggota dan catat siapa membayar apa. Fair Share langsung merangkum seluruh pengeluaran grup.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 text-xl font-medium text-black bg-white rounded-2xl shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="relative shrink-0">
                <span className="absolute flex justify-center items-center z-10 text-white h-full w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                    />
                  </svg>
                </span>
                <Image
                  src="/assets/img/fair-share-badge.svg"
                  width={80}
                  height={85}
                  className="inline-block animate-spin-super-slow filter hue-rotate-30"
                  alt=""
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Rekomendasi Transfer</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Dapatkan jawaban sederhana tentang siapa harus membayar siapa dan berapa nominalnya.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 text-xl font-medium text-black bg-white rounded-2xl shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="relative shrink-0">
                <span className="absolute flex justify-center items-center z-10 text-white h-full w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </span>
                <Image
                  src="/assets/img/fair-share-badge.svg"
                  width={80}
                  height={85}
                  className="inline-block animate-spin-super-slow filter -hue-rotate-60"
                  alt=""
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Rekap Siap Dibagikan</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tandai pembayaran yang sudah lunas, lalu salin rekap rapi untuk dibagikan ke grup WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adil, Jelas, Tanpa Drama Section */}
      <section className="mt-8 py-12 md:py-16 rounded-t-3xl md:rounded-t-[50px] bg-gray-100">
        <div className="px-4 mx-auto mb-8 max-w-6xl text-center md:mb-12">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
            Adil, Jelas, Tanpa Drama
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 mx-auto max-w-5xl text-center md:grid-cols-3">
          <div className="relative row-span-2 p-6 text-lg font-medium text-gray-600 bg-white md:rounded-2xl flex flex-col justify-between items-center">
            <p className="mb-6">
              Masih bingung siapa nombok paling banyak? Fair Share kasih jawabannya:
            </p>
            <Image
              className="object-contain"
              width={260}
              height={220}
              src="/assets/img/meong-maskot-12.webp"
              alt="Udang di balik batu patungan"
            />
          </div>

          <div className="p-8 text-2xl font-semibold text-gray-700 bg-white rounded-2xl flex items-center justify-center">
            Hitungan <br className="hidden md:block" /> Presisi
          </div>

          <div className="p-8 text-2xl font-semibold text-gray-700 bg-white rounded-2xl flex items-center justify-center">
            Saldo <br className="hidden md:block" /> Transparan
          </div>

          <div className="p-8 text-2xl font-semibold text-gray-700 bg-white rounded-2xl flex items-center justify-center">
            Status <br className="hidden md:block" /> Pelunasan
          </div>

          <div className="flex justify-center items-center p-6 bg-white md:bg-transparent rounded-2xl">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="btn primary btn-lg group w-full"
            >
              Mulai Patungan Gratis
              <span className="has-arrow inline-flex ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Teman & Keluarga Section with Cloud Animation */}
      <section className="relative py-8 text-center bg-gray-100 md:py-16">
        <div className="px-4 mx-auto mb-16 max-w-6xl text-center">
          <h2 className="text-5xl font-medium max-md:text-3xl">
            Teman &amp; Keluarga
            <br />
            Bisa Patungan Lebih Rapi
          </h2>
        </div>

        <div
          className="px-4 bg-scroll bg-center bg-repeat-x animate-bg-scroll"
          style={{ backgroundImage: `url('/assets/img/fair-share-cloud.svg')` }}
        >
          <img
            className="mx-auto w-full max-w-3xl"
            src="/assets/img/meong-maskot-9.webp"
            alt="Teman & Keluarga Bisa Patungan Lebih Rapi"
          />
        </div>
      </section>

      {/* Nggak Cuma Sekadar Bagi Rata */}
      <section className="py-12 bg-gradient-to-b from-gray-100 rounded-t-3xl md:py-20">
        <div className="px-4 mx-auto max-w-5xl">
          <div className="gap-8 justify-between items-center md:flex">
            <div className="mb-8 md:w-2/3 max-md:text-center">
              <h2 className="mb-6 text-4xl md:text-5xl font-medium tracking-tight leading-tight">
                Nggak Cuma
                <br />
                Sekadar Bagi Rata
              </h2>

              <p className="mb-8 text-xl text-gray-500">
                Dari catatan pengeluaran sampai pelunasan, semuanya ada dalam satu alur
              </p>

              <ul className="space-y-4 text-lg">
                {[
                  "Catatan Pengeluaran",
                  "Jatah & Saldo Anggota",
                  "Rekomendasi Transfer",
                  "Checklist Pelunasan",
                  "Rekap untuk WhatsApp",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-x-4 max-md:justify-center items-center">
                    <span className="flex justify-center items-center rounded-full size-7 bg-theme-500 shrink-0">
                      <svg
                        className="shrink-0 size-3.5 text-gray-900"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center md:justify-end">
              <Image
                className="w-full max-w-md max-md:mx-auto object-contain"
                width={394}
                height={374}
                src="/assets/img/meong-maskot-6.webp"
                alt="Maskot Fair Share 3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Langkah Section */}
      <section className="relative isolate py-12 bg-gradient-to-t from-gray-100 md:py-20 overflow-hidden">
        <div className="px-4 mx-auto max-w-6xl relative z-10">
          <div className="gap-8 justify-between items-center md:flex">
            <div className="flex flex-col items-center">
              <div className="relative mb-6 text-center max-md:max-w-[220px] inline-block p-4 mx-auto text-white rounded-2xl bg-orange-700 text-sm font-semibold shadow-md">
                Gak perlu spreadsheet. Gak perlu debat.
              </div>

              <Image
                className="mx-auto mb-6 max-w-xs w-full max-md:max-w-[120px] object-contain relative z-20"
                width={320}
                height={335}
                src="/assets/img/meong-maskot-11.webp"
                alt="Maskot Fair Share langkah"
              />
            </div>

            <div className="mb-8 w-full max-w-2xl">
              <h2 className="mb-8 text-4xl md:text-5xl font-medium text-center tracking-tight leading-tight">
                3 Langkah
                <br />
                Patungan Langsung Beres
              </h2>

              <div className="grid overflow-hidden grid-cols-1 mb-8 rounded-3xl md:grid-cols-3 md:gap-4 gap-3">
                <div className="p-6 text-center bg-white shadow-xs rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-center mx-auto mb-3 w-8 h-8 font-bold text-gray-900 rounded-full bg-theme-500">
                    1
                  </div>
                  <div className="font-medium text-gray-800">
                    Buat Event &amp; Tambahkan Anggota
                  </div>
                </div>

                <div className="p-6 text-center bg-white shadow-xs rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-center mx-auto mb-3 w-8 h-8 font-bold text-gray-900 rounded-full bg-theme-500">
                    2
                  </div>
                  <div className="font-medium text-gray-800">
                    Catat Pengeluaran &amp; Pembayar
                  </div>
                </div>

                <div className="p-6 text-center bg-white shadow-xs rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-center mx-auto mb-3 w-8 h-8 font-bold text-gray-900 rounded-full bg-theme-500">
                    3
                  </div>
                  <div className="font-medium text-gray-800">
                    Cek Transfer &amp; Tandai Lunas
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Link
                  href={user ? "/dashboard" : "/register"}
                  className="btn primary btn-lg group shadow-sm"
                >
                  Mulai Patungan Gratis
                  <span className="has-arrow inline-flex ml-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden absolute right-0 left-0 bottom-10 mx-auto w-full h-full pointer-events-none z-0">
            <img
              className="absolute right-0 left-0 mx-auto animate-slow-cloud min-w-[900px] md:min-w-[1200px] w-full"
              src="/assets/img/fair-share-cloud2.svg"
              alt=""
            />
          </div>
        </div>
      </section>

      {/* Testimonials Pengguna */}
      <section className="relative py-8 bg-gradient-to-b from-gray-100 md:py-16">
        <div className="px-4 mx-auto max-w-6xl">
          <div>
            <h2 className="mb-8 text-5xl font-medium text-center md:mb-16 max-md:text-3xl">
              Contoh Situasi Patungan yang Lebih Rapi
            </h2>

            <SituationTestimonialSlider />
          </div>
        </div>
      </section>

      {/* Semua Hitungan Transparan Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-blue-50 rounded-t-3xl md:rounded-t-[50px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mx-auto max-w-5xl items-center">
          <div className="md:col-span-2 max-md:text-center">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
              Semua Hitungan Transparan
            </h2>
            <div className="text-lg font-medium text-gray-600 leading-relaxed">
              Fair Share memperlihatkan total pengeluaran, jatah masing-masing, saldo setiap anggota, dan transfer pelunasan. Semua orang bisa memahami hasilnya tanpa hitung ulang.
            </div>
            <Link
              href={user ? "/dashboard" : "/register"}
              className="btn primary btn-lg group mt-8 inline-flex"
            >
              Mulai Patungan Gratis
              <span className="has-arrow inline-flex ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </span>
            </Link>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image
              className="object-contain"
              width={230}
              height={230}
              src="/assets/img/meong-maskot-14.webp"
              alt="Maskot Fair Share transparan"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-blue-50/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 px-4">
          <div className="md:w-2/5 flex flex-col items-center md:items-start text-center md:text-left">
            <Image
              className="mb-6 object-contain"
              width={200}
              height={200}
              src="/assets/img/meong-maskot-12.webp"
              alt="Maskot Fair Share FAQ"
            />
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              Pertanyaan Umum tentang Fair Share
            </h2>
            <p className="text-gray-500 text-sm">
              Semua jawaban lengkap seputar cara kerja, keadilan pembagian, dan fitur pelunasan.
            </p>
          </div>

          <div className="space-y-3 w-full md:w-3/5">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-colors"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900">
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-xl rounded-full bg-slate-100 text-slate-700 transition-transform group-open:rotate-45 font-mono">
                    +
                  </span>
                </summary>
                <div className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />

      {/* Floating WhatsApp */}
      <WhatsAppFloatingButton />
    </div>
  );
}
