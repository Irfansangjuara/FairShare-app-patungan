"use client";

import { useState, useTransition } from "react";
import { createExpenseAction, updateExpenseAction } from "../server/actions/expense";
import { formatRupiah, parseRupiahInput } from "../lib/money";
import { Plus, Pencil, X, AlertCircle } from "lucide-react";

interface MemberOption {
  id: string;
  name: string;
}

interface ExpenseFormDialogProps {
  eventId: string;
  members: MemberOption[];
  hasPaidSettlements: boolean;
  expenseToEdit?: {
    id: string;
    title: string;
    amount: bigint;
    paidByMemberId: string;
  } | null;
  triggerButton?: React.ReactNode;
}

export function ExpenseFormDialog({
  eventId,
  members,
  hasPaidSettlements,
  expenseToEdit,
  triggerButton,
}: ExpenseFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(expenseToEdit?.title || "");
  const [amountStr, setAmountStr] = useState(
    expenseToEdit ? expenseToEdit.amount.toString() : ""
  );
  const [payerId, setPayerId] = useState(
    expenseToEdit?.paidByMemberId || (members[0]?.id || "")
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setTitle(expenseToEdit?.title || "");
    setAmountStr(expenseToEdit ? expenseToEdit.amount.toString() : "");
    setPayerId(expenseToEdit?.paidByMemberId || (members[0]?.id || ""));
    setErrorMsg(null);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (hasPaidSettlements) {
      setErrorMsg(
        "Ada transfer yang sudah berstatus Lunas. Batalkan status lunas terlebih dahulu untuk menambah atau mengedit pengeluaran."
      );
      return;
    }

    const amt = parseRupiahInput(amountStr);
    if (amt <= BigInt(0)) {
      setErrorMsg("Nominal pengeluaran harus lebih besar dari Rp 0.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Deskripsi pengeluaran wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("amount", amt.toString());
    formData.append("paidByMemberId", payerId);

    startTransition(async () => {
      let res;
      if (expenseToEdit) {
        res = await updateExpenseAction(expenseToEdit.id, eventId, null, formData);
      } else {
        res = await createExpenseAction(eventId, null, formData);
      }

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setIsOpen(false);
        if (!expenseToEdit) {
          setTitle("");
          setAmountStr("");
        }
      }
    });
  };

  const previewAmount = parseRupiahInput(amountStr);

  return (
    <>
      {triggerButton ? (
        <div onClick={handleOpen}>{triggerButton}</div>
      ) : expenseToEdit ? (
        <button
          onClick={handleOpen}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Ubah Pengeluaran"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          disabled={members.length === 0}
          className="btn-pill-lime text-xs sm:text-sm py-2 px-4 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pengeluaran</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="card-diskon w-full max-w-md p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {expenseToEdit ? "Ubah Pengeluaran" : "Catat Pengeluaran Baru"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {hasPaidSettlements && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> Ada transfer yang berstatus Lunas. Anda harus
                  membatalkan status lunas tersebut sebelum dapat menyimpan perubahan pengeluaran.
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
                  Deskripsi Pengeluaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Makan Siang, Tiket Masuk, Sewa Mobil"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Rupiah (IDR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
                {previewAmount > BigInt(0) && (
                  <p className="text-xs font-bold text-slate-700 mt-1 font-mono-numbers">
                    Format: {formatRupiah(previewAmount)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dibayar Oleh Siapa? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
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
                  disabled={isPending || hasPaidSettlements}
                  className="btn-pill-primary text-xs py-2 px-5"
                >
                  {isPending ? "Menyimpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
