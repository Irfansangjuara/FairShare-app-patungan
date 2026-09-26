import { getSessionUser } from "../../../lib/auth";
import { getUserEvents } from "../../../server/queries";
import { redirect } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import Link from "next/link";
import { formatRupiah } from "../../../lib/money";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Receipt,
  ArrowRight,
  Archive,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const allEvents = await getUserEvents(user.id);
  const activeEvents = allEvents.filter((e) => !e.isArchived);
  const archivedEvents = allEvents.filter((e) => e.isArchived);

  const totalOverallExpenses = allEvents.reduce((sum, e) => sum + e.totalAmount, BigInt(0));

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-6xl w-full px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Dashboard Event
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              Kelola trip dan pantau status transfer pelunasan teman-teman Anda.
            </p>
          </div>

          <Link href="/events/new" className="btn-pill-lime w-full sm:w-auto justify-center py-2.5 px-5 font-bold shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Buat Event Baru</span>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card-diskon p-4 sm:p-5">
            <span className="text-xs font-medium text-slate-500 block">Event Aktif</span>
            <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
              {activeEvents.length} <span className="text-xs font-normal text-slate-500">kegiatan</span>
            </div>
          </div>

          <div className="card-diskon p-4 sm:p-5">
            <span className="text-xs font-medium text-slate-500 block">Total Pengeluaran Tercatat</span>
            <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
              {formatRupiah(totalOverallExpenses)}
            </div>
          </div>

          <div className="card-diskon p-4 sm:p-5">
            <span className="text-xs font-medium text-slate-500 block">Total Semua Event</span>
            <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
              {allEvents.length}
            </div>
          </div>
        </div>

        {/* Active Events List */}
        <div className="space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Event Aktif</h2>
            <span className="text-xs font-semibold text-slate-500">
              {activeEvents.length} Event
            </span>
          </div>

          {activeEvents.length === 0 ? (
            <div className="card-diskon p-8 sm:p-12 text-center bg-white space-y-4">
              <div className="mx-auto flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Receipt className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Belum ada event aktif</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Mulai dengan membuat event trip pertama Anda untuk mencatat peserta dan pengeluaran.
                </p>
              </div>
              <div>
                <Link href="/events/new" className="btn-pill-lime text-xs sm:text-sm py-2.5 px-5 font-bold">
                  <Plus className="h-4 w-4" />
                  <span>Buat Event Sekarang</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">

              {activeEvents.map((evt) => {
                const isAllPaid = evt.settlementCount > 0 && evt.unpaidCount === 0;

                return (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.id}`}
                    className="card-diskon p-5 bg-white flex flex-col justify-between group hover:border-slate-400 transition-all hover:-translate-y-0.5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-950 truncate">
                          {evt.title}
                        </h3>
                        {isAllPaid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold shrink-0">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Lunas
                          </span>
                        ) : evt.settlementCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-semibold shrink-0">
                            <Clock className="h-3 w-3 text-amber-700" />
                            {evt.unpaidCount} belum
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-medium shrink-0">
                            Baru
                          </span>
                        )}
                      </div>

                      {(evt.location || evt.eventDate) && (
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {evt.location && (
                            <div className="flex items-center gap-1 truncate">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{evt.location}</span>
                            </div>
                          )}
                          {evt.eventDate && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span>{evt.eventDate}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Biaya</span>
                        <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                          {formatRupiah(evt.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{evt.memberCount}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Archived Events */}
        {archivedEvents.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-600">
              <Archive className="h-4 w-4" />
              <h2 className="text-base font-bold">Event Diarsipkan ({archivedEvents.length})</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedEvents.map((evt) => (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className="card-diskon p-4 bg-slate-50 border-slate-200 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <h4 className="font-bold text-sm text-slate-800 truncate">{evt.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                    <span className="font-mono-numbers">{formatRupiah(evt.totalAmount)}</span>
                    <span>{evt.memberCount} peserta</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
