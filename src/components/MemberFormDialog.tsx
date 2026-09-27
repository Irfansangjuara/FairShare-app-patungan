"use client";

import { useState, useEffect, useTransition } from "react";
import {
  addMemberAction,
  updateMemberAction,
  getSavedParticipantsAction,
  SavedParticipantItem,
} from "../server/actions/member";
import { UserPlus, Pencil, X, AlertCircle, CreditCard, Sparkles, Check, User, Landmark } from "lucide-react";

interface MemberFormDialogProps {
  eventId: string;
  expenseCount: number;
  memberToEdit?: {
    id: string;
    name: string;
    bankAccount?: string | null;
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
  const [bankAccount, setBankAccount] = useState(memberToEdit?.bankAccount || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SavedParticipantItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setName(memberToEdit?.name || "");
    setBankAccount(memberToEdit?.bankAccount || "");
    setErrorMsg(null);
    setIsOpen(true);
  };

  // Load suggestions when opening in add mode
  useEffect(() => {
    if (isOpen && !memberToEdit) {
      getSavedParticipantsAction().then((list) => {
        setSuggestions(list);
      });
    }
  }, [isOpen, memberToEdit]);

  const handleSelectSuggestion = (item: SavedParticipantItem) => {
    setName(item.name);
    if (item.bankAccount) {
      setBankAccount(item.bankAccount);
    }
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
    if (bankAccount.trim()) {
      formData.append("bankAccount", bankAccount.trim());
    }

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
        if (!memberToEdit) {
          setName("");
          setBankAccount("");
        }
      }
    });
  };

  const isAddBlocked = !memberToEdit && expenseCount > 0;

  // Filter suggestions matching current input
  const filteredSuggestions = suggestions.filter(
    (s) =>
      !name ||
      s.name.toLowerCase().includes(name.toLowerCase()) ||
      (s.bankAccount && s.bankAccount.toLowerCase().includes(name.toLowerCase()))
  );

  return (
    <>
      {triggerButton ? (
        <div onClick={handleOpen}>{triggerButton}</div>
      ) : memberToEdit ? (
        <button
          onClick={handleOpen}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Ubah Data Peserta"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          disabled={isAddBlocked}
          className="btn-pill-primary text-xs sm:text-sm py-2 px-4 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            isAddBlocked
              ? "Peserta tidak dapat ditambah setelah pengeluaran dicatat"
              : "Tambah Peserta"
          }
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
                {memberToEdit ? "Ubah Data Peserta" : "Tambah Peserta Baru"}
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
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Nama Peserta <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center w-full rounded-xl border border-slate-300 bg-white transition-all shadow-2xs focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-[#b7e913]/60">
                  <div className="pl-3.5 pr-2.5 py-2.5 flex items-center justify-center text-slate-400 shrink-0 select-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso, Sinta, Irfan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isAddBlocked}
                    style={{ paddingLeft: 0, border: "none" }}
                    className="w-full flex-1 bg-transparent py-2.5 pr-3.5 pl-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:bg-transparent disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Suggestions from past campaigns (Feature #3) */}
              {!memberToEdit && filteredSuggestions.length > 0 && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    <Sparkles className="h-3.5 w-3.5 text-[#b7e913] fill-[#b7e913]" />
                    <span>Saran dari Campaign Sebelumnya:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-0.5">
                    {filteredSuggestions.slice(0, 6).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-300 hover:border-slate-900 hover:bg-slate-100 px-2 py-1 rounded-full text-slate-800 transition-colors"
                        title={item.bankAccount ? `Rekening: ${item.bankAccount}` : undefined}
                      >
                        <span className="font-medium">{item.name}</span>
                        {item.bankAccount && (
                          <span className="text-[10px] text-slate-400">💳</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                    <span>Rekening Pembayaran / E-Wallet</span>
                  </label>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
                    Opsional
                  </span>
                </div>
                <div className="flex items-center w-full rounded-xl border border-slate-300 bg-white transition-all shadow-2xs focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-[#b7e913]/60">
                  <div className="pl-3.5 pr-2.5 py-2.5 flex items-center justify-center text-slate-400 shrink-0 select-none">
                    <Landmark className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="BCA 1234567890 a.n Budi atau GoPay 0812..."
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    style={{ paddingLeft: 0, border: "none" }}
                    className="w-full flex-1 bg-transparent py-2.5 pr-3.5 pl-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5 leading-normal">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Ditampilkan saat anggota lain ingin mentransfer pelunasan patungan.</span>
                </p>
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
