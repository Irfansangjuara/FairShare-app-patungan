import { getSessionUser } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import { NewEventForm } from "./NewEventForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewEventPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-xl w-full py-4 sm:py-6 space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans">
          Buat Event Patungan Baru
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Beri judul kegiatan trip atau acara Anda untuk mulai mencatat peserta dan pengeluaran.
        </p>
      </div>

      <NewEventForm />
    </div>
  );
}
