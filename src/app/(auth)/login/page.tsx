import Image from "next/image";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";
import { FairShareNavbar } from "../../../components/FairShareNavbar";
import { PublicFooter } from "../../../components/PublicFooter";
import { WhatsAppFloatingButton } from "../../../components/WhatsAppFloatingButton";
import { LoginForm } from "../../../components/LoginForm";
import { getSiteSettings } from "../../../server/queries";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = `Masuk Fair Share | Kelola Patungan & Pelunasan`;
  const description =
    "Masuk ke Fair Share untuk kelola patungan, cek saldo anggota, dan pantau status pelunasan grup.";
  const ogImageUrl = settings.defaultOgImage || "/assets/img/fair-share-cover.webp";

  return {
    title,
    description,
    alternates: {
      canonical: "/login",
    },
    openGraph: {
      title,
      description,
      url: "https://app-fairshare.vercel.app/login",
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const error = resolvedParams?.error ? decodeURIComponent(resolvedParams.error) : undefined;
  const redirectTarget = resolvedParams?.redirect && resolvedParams.redirect.startsWith("/")
    ? resolvedParams.redirect
    : "/dashboard";
  const googleOAuthUrl = `/api/auth/google?redirect=${encodeURIComponent(redirectTarget)}`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Floating Header */}
      <FairShareNavbar user={user} />

      {/* Main Login Section */}
      <section className="relative py-8 bg-gradient-to-t from-white md:py-16 overflow-hidden flex-1">
        <div className="px-4 mx-auto max-w-6xl">
          <div className="gap-4 justify-between items-center md:flex">
            <div className="mx-auto mb-8 w-full max-w-4xl">
              <h1 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-medium text-center tracking-tight">
                Masuk ke Akun Fair Share
              </h1>

              {/* Maskot Animasi Melayang untuk Mobile dan Tablet */}
              <div className="flex justify-center mb-8 lg:hidden">
                <Image
                  className="w-36 sm:w-44 md:w-48 h-auto animate-slow-cloud-up object-contain drop-shadow-xs"
                  width={230}
                  height={281}
                  src="/assets/img/meong-maskot-5.webp"
                  alt="Maskot Fair Share"
                  priority
                />
              </div>

              <div className="justify-between items-center mx-auto w-full max-w-4xl lg:flex gap-8">
                {/* Form Column */}
                <div className="w-full lg:w-1/2">
                  <div className="mt-2 sm:mt-5">
                    {/* Google OAuth Button */}
                    <a
                      href={googleOAuthUrl}
                      className="w-full btn shadow-xs flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50"
                    >
                      <svg
                        className="w-5 h-auto shrink-0"
                        width="46"
                        height="47"
                        viewBox="0 0 46 47"
                        fill="none"
                      >
                        <path
                          d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z"
                          fill="#34A853"
                        />
                        <path
                          d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z"
                          fill="#EB4335"
                        />
                      </svg>
                      <span className="font-medium text-gray-700">Lanjutkan dengan Google</span>
                    </a>

                    {/* Divider */}
                    <div className="flex items-center py-6 text-sm text-gray-400 before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6">
                      Atau masuk dengan email atau WhatsApp
                    </div>

                    {/* Login Form */}
                    <LoginForm initialError={error} />
                  </div>
                </div>

                {/* Mascot Column (Desktop only) */}
                <div className="hidden lg:flex lg:w-1/2 justify-center">
                  <Image
                    className="ml-auto w-4/5 animate-slow-cloud-up object-contain drop-shadow-sm"
                    width={230}
                    height={281}
                    src="/assets/img/meong-maskot-5.webp"
                    alt="Maskot Fair Share"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Background Layer */}
          <div className="overflow-hidden absolute right-0 bottom-0 left-0 mx-auto w-full h-full -z-10">
            <img
              className="absolute right-0 left-0 mx-auto animate-slow-cloud"
              src="/assets/img/fair-share-cloud2.svg"
              alt=""
            />
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
