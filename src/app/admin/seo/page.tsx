import { getSiteSettings } from "../../../server/queries";
import { GlobalSeoForm } from "../../../components/GlobalSeoForm";

export default async function AdminSeoPage() {
  const settings = await getSiteSettings();

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Pengaturan SEO Global
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Atur nama website, format judul halaman Google, meta deskripsi default, dan gambar Open Graph.
        </p>
      </div>

      <GlobalSeoForm initialSettings={settings} />
    </main>
  );
}
