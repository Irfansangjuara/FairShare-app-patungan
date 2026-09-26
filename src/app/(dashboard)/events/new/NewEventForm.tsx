"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createEventAction } from "../../../../server/actions/event";
import { ArrowLeft, ArrowRight, Calendar, MapPin } from "lucide-react";

export function NewEventForm() {
  const [state, formAction, isPending] = useActionState(createEventAction, null);

  return (
    <div className="card-diskon p-6 sm:p-8 bg-white border border-slate-200">
      {state?.error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Judul Event <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Contoh: Liburan Jogja, Futsal Mingguan, Camping Pangalengan"
            className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <span className="text-[11px] text-slate-400 block mt-1">
            Wajib diisi, minimal 3 karakter.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Lokasi (Opsional)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="location"
              placeholder="Contoh: Yogyakarta, Pantai Indah Kapuk"
              className="w-full rounded-2xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tanggal Kegiatan (Opsional)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="date"
              name="eventDate"
              className="w-full rounded-2xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white"
            />
          </div>
        </div>

        <div className="pt-3 border-t flex items-center justify-end gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-pill-lime text-xs sm:text-sm py-2.5 px-6 shadow-md flex items-center gap-2"
          >
            <span>{isPending ? "Membuat..." : "Buat Event & Lanjut"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
