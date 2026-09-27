import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getSitePageByKey, getSiteSettings } from "../../server/queries";
import { getSessionUser } from "../../lib/auth";
import { FairShareNavbar } from "../../components/FairShareNavbar";
import { PublicFooter } from "../../components/PublicFooter";
import { WhatsAppFloatingButton } from "../../components/WhatsAppFloatingButton";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSitePageByKey("about");
  const settings = await getSiteSettings();
  const title = page?.seoTitle || `Tentang Fair Share | Kelola Patungan & Pelunasan Adil`;
  const description =
    page?.seoDescription ||
    "Bukan sekadar bagi tagihan, Fair Share bikin patungan trip, makan bareng, dan liburan terasa adil tanpa drama spreadsheet.";
  const ogImageUrl = page?.ogImage || settings.defaultOgImage || "/assets/img/fair-share-cover.webp";

  return {
    title,
    description,
    alternates: {
      canonical: page?.canonicalUrl || "/about",
    },
    robots: {
      index: !page?.isNoindex,
      follow: !page?.isNoindex,
    },
    openGraph: {
      title,
      description,
      url: "https://app-fairshare.vercel.app/about",
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

export default async function AboutPage() {
  const user = await getSessionUser();

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
                Tentang Fair Share
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-center">
                <div className="my-auto h-fit max-md:text-center col-span-2">
                  <h1 className="mb-8 text-5xl font-medium max-md:text-3xl tracking-tight leading-tight">
                    Bukan Sekadar Bagi Tagihan,
                    <br className="max-md:hidden" />
                    {" "}Kita{" "}
                    <span className="text-blue-500">#PatunganTanpaDrama</span>
                  </h1>

                  <p className="text-gray-500 md:text-xl mb-8 leading-relaxed">
                    Bantu teman, keluarga, dan rekan kerja bereskan patungan dengan hitungan yang adil dan jelas.
                  </p>

                  <Link href="/register" className="btn btn-lg primary group">
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
                    src="/assets/img/meong-maskot-7.webp"
                    alt="Tentang Fair Share"
                    width={359}
                    height={367}
                    priority
                    className="mx-auto md:mr-0 max-md:max-w-48 object-contain"
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

      {/* Team / Organization Section */}
      <section className="py-12 mx-auto px-4 max-w-5xl text-center">
        <h2 className="mb-8 text-4xl font-medium max-md:text-3xl text-center">
          Tim di Balik Fair Share
        </h2>
        <div className="flex justify-center">
          <Image
            src="/assets/img/meong-maskot-9.webp"
            alt="Fair Share"
            width={800}
            height={400}
            className="mx-auto rounded-2xl shadow-xs object-contain"
          />
        </div>
      </section>

      {/* Kenapa Fair Share Ada (Theme Accent Banner) */}
      <section className="mt-8 py-8 md:pt-16 pb-16 md:pb-32 rounded-t-3xl md:rounded-t-[50px] bg-theme-500">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="gap-8 justify-around items-center md:flex py-8">
            <div className="flex justify-center">
              <Image
                className="max-w-[230px] mb-8 mx-auto w-full max-md:max-w-[120px] object-contain animate-slow-cloud-up"
                width={230}
                height={281}
                src="/assets/img/meong-maskot-3.webp"
                alt="Maskot Fair Share"
              />
            </div>

            <div className="md:max-w-xl max-md:text-center text-gray-900">
              <div className="text-xl mb-4 font-semibold text-gray-800">
                Kenapa Fair Share Ada
              </div>

              <h2 className="mb-6 text-4xl font-medium max-md:text-3xl leading-snug">
                Kami di sini buat bikin patungan terasa adil. Sesederhana itu.
              </h2>

              <p className="text-xl text-gray-800/90 leading-relaxed">
                Fair Share merapikan catatan pengeluaran, menghitung jatah setiap anggota, dan menyusun
                rekomendasi transfer — supaya grupmu cukup fokus menikmati acara bersama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story & Philosophy Section */}
      <section className="sm:-mt-12 max-sm:!rounded-none py-8 md:py-16 rounded-t-3xl md:rounded-t-[50px] bg-gradient-to-b via-blue-50 from-blue-100">
        <div className="max-w-5xl px-4 mx-auto space-y-12">
          {/* Card 1 */}
          <div className="gap-8 justify-between items-center md:flex py-6">
            <div className="mb-8 md:w-1/2 max-md:text-center">
              <h2 className="mb-6 text-4xl font-medium max-md:text-3xl leading-snug">
                Patungan Gak Harus
                <br className="max-lg:hidden" />
                {" "}Susah &amp; Ribet
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                Kami ingin siapa pun bisa mengelola patungan dengan rapi, tanpa
                spreadsheet rumit atau hitung ulang berkali-kali.
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <Image
                className="w-full max-md:mx-auto object-contain"
                width={230}
                height={281}
                src="/assets/img/meong-maskot-untitled-2.webp"
                alt="Pengguna duduk santai"
              />
            </div>
          </div>

          {/* Card 2 */}
          <div className="gap-8 justify-between items-center md:flex py-6">
            <div className="flex justify-center">
              <Image
                className="w-full max-md:mx-auto max-w-[230px] max-md:max-w-[128px] object-contain animate-slow-cloud-up"
                width={230}
                height={281}
                src="/assets/img/meong-maskot-5.webp"
                alt="Maskot Fair Share empati"
              />
            </div>

            <div className="mb-8 max-w-2xl max-md:text-center bg-white rounded-3xl rounded-bl-none p-8 md:p-10 shadow-sm border border-gray-100">
              <h2 className="mb-6 text-4xl font-medium max-md:text-3xl leading-snug">
                Karena Kami Pernah di Posisi Kamu
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                Kami tahu rasanya pegang banyak struk,{" "}
                <span className="text-black font-semibold">chat tercecer</span>,
                lalu bingung siapa sudah membayar apa. Fair Share dibuat supaya semua catatan dan pelunasan
                kembali jelas.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="gap-8 justify-between items-center md:flex py-6">
            <div className="mb-8 md:w-2/3 max-md:text-center">
              <div className="text-xl mb-4 font-semibold text-gray-800">
                Lebih dari Kalkulator Patungan
              </div>
              <h2 className="mb-6 text-4xl font-medium max-md:text-3xl leading-snug">
                Kita{" "}
                <span className="text-orange-500 font-semibold">Teman Beresin</span>
                {" "}Patungan Kamu
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                Fair Share mendampingi dari pengeluaran pertama sampai transfer terakhir,
                agar semua anggota tahu jatah, saldo, dan status lunasnya.
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <Image
                className="max-w-[345px] max-md:mx-auto w-full max-md:max-w-[270px] object-contain"
                width={345}
                height={422}
                src="/assets/img/meong-maskot-11.webp"
                alt="Maskot teman beresin patungan"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Call To Action */}
      <section className="relative py-16 text-center md:py-24 overflow-hidden">
        <div
          className="px-4 mb-10 bg-scroll bg-center bg-repeat-x animate-bg-scroll"
          style={{ backgroundImage: `url('/assets/img/fair-share-cloud.svg')` }}
        >
          <Image
            className="mx-auto"
            src="/assets/img/meong-maskot-6.webp"
            alt="Rumah Fair Share"
            width={174}
            height={142}
          />

          <h2 className="my-8 text-5xl font-medium text-center max-md:text-3xl tracking-tight">
            Saatnya Patungan <br className="max-md:hidden" /> Lebih Adil
          </h2>

          <div className="max-w-lg mx-auto mt-6 text-gray-600 text-lg">
            <p>Mulai sekarang. Gratis. Tanpa spreadsheet.</p>
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/register" className="btn primary btn-lg group shadow-md">
              Mulai Patungan Sekarang
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

      {/* Footer */}
      <PublicFooter />

      {/* Floating WhatsApp */}
      <WhatsAppFloatingButton />
    </div>
  );
}
