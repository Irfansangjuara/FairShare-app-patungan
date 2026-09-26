"use client";

import { useState, useTransition } from "react";
import {
  updateEventAction,
  toggleArchiveEventAction,
  deleteEventAction,
} from "../server/actions/event";
import { Settings, X, Archive, Trash2, Calendar, MapPin } from "lucide-react";

interface EventSettingsDialogProps {
  eventId: string;
  title: string;
  location?: string | null;
  eventDate?: string | null;
  isArchived: boolean;
}

export function EventSettingsDialog({
  eventId,
  title: initialTitle,
  location: initialLocation,
  eventDate: initialDate,
  isArchived,
}: EventSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [location, setLocation] = useState(initialLocation || "");
  const [eventDate, setEventDate] = useState(initialDate || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("location", location);
    formData.append("eventDate", eventDate);

    startTransition(async () => {
      const res = await updateEventAction(eventId, null, formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await toggleArchiveEventAction(eventId);
      setIsOpen(false);
    });
  };

  const handleDelete = () => {
    if (
      confirm(
        `PERINGATAN: Apakah Anda yakin ingin menghapus permanen event "${title}" beserta seluruh peserta, pengeluaran, dan pelunasannya? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      startTransition(async () => {
        await deleteEventAction(eventId);
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
        title="Pengaturan Event"
      >
        <Settings className="h-3.5 w-3.5 text-slate-500" />
        <span className="hidden sm:inline">Pengaturan</span>
        <span className="sm:hidden">Setting</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3.5 sm:p-4 animate-in fade-in">
          <div className="card-diskon w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Pengaturan Event</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>


            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Event <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi (Opsional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Yogyakarta, Bali, Villa Bougenville"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Kegiatan (Opsional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-pill-primary text-xs py-2 px-5"
                >
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>

            <div className="border-t pt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Zona Berbahaya
              </h4>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>{isArchived ? "Buka Arsip Event" : "Arsipkan Event"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Event</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
