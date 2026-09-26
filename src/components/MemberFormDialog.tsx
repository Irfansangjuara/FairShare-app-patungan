"use client";

import { useState, useTransition } from "react";
import { addMemberAction, updateMemberAction } from "../server/actions/member";
import { UserPlus, Pencil, X, AlertCircle } from "lucide-react";

interface MemberFormDialogProps {
  eventId: string;
  expenseCount: number;
  memberToEdit?: {
    id: string;
    name: string;
  } | null;
  triggerButton?: React.ReactNode;
}

export function MemberFormDialog({
  eventId,
  expenseCount,
  memberToEdit,
  triggerButton,
}: MemberFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(memberToEdit?.name || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setName(memberToEdit?.name || "");
    setErrorMsg(null);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Nama peserta wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmed);

    startTransition(async () => {
      let res;
      if (memberToEdit) {
        res = await updateMemberAction(memberToEdit.id, eventId, null, formData);
      } else {
        res = await addMemberAction(eventId, null, formData);
      }

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setIsOpen(false);
        if (!memberToEdit) setName("");
      }
    });
  };

  const isAddBlocked = !memberToEdit && expenseCount > 0;

  return (
    <>
      {triggerButton ? (
        <div onClick={handleOpen}>{triggerButton}</div>
      ) : memberToEdit ? (
        <button
          onClick={handleOpen}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Ubah Nama Peserta"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="btn-pill-primary text-xs sm:text-sm py-2 px-4 shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Peserta</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3.5 sm:p-4 animate-in fade-in">
          <div className="card-diskon w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {memberToEdit ? "Ubah Nama Peserta" : "Tambah Peserta Baru"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>


            {isAddBlocked && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Aturan MVP:</strong> Peserta tidak dapat ditambah setelah pengeluaran
                  dicatat agar jatah historis tidak berubah. Anda dapat menghapus semua pengeluaran
                  terlebih dahulu jika ingin menambah peserta baru.
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Peserta <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi, Sinta, Irfan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isAddBlocked}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:bg-slate-100 disabled:opacity-60"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || isAddBlocked}
                  className="btn-pill-primary text-xs py-2 px-5"
                >
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
