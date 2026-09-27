import { getSitePageByKey } from "../../../../../server/queries";
import { notFound } from "next/navigation";
import { PageEditor } from "../../../../../components/PageEditor";

interface EditStandardPageProps {
  params: Promise<{ key: string }>;
}

export default async function EditStandardPage({ params }: EditStandardPageProps) {
  const { key } = await params;
  const page = await getSitePageByKey(key);

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Edit Halaman: {page.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ubah judul, konten isi, gambar utama, dan pengaturan meta tag SEO Google.
        </p>
      </div>

      <PageEditor page={page} />
    </main>
  );
}
