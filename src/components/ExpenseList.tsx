"use client";

import { useTransition } from "react";
import { formatRupiah } from "../lib/money";
import { deleteExpenseAction } from "../server/actions/expense";
import { ExpenseFormDialog } from "./ExpenseFormDialog";
import { Trash2, AlertCircle } from "lucide-react";

interface ExpenseItem {
  id: string;
  title: string;
  amount: bigint;
  paidByMemberId: string;
  createdAt: Date | string;
  paidByMember?: {
    id: string;
    name: string;
  };
}

interface ExpenseListProps {
  eventId: string;
  expenses: ExpenseItem[];
  members: Array<{ id: string; name: string }>;
  hasPaidSettlements: boolean;
  isOwner: boolean;
}

export function ExpenseList({
  eventId,
  expenses,
  members,
  hasPaidSettlements,
  isOwner,
}: ExpenseListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (expenseId: string, title: string) => {
    if (hasPaidSettlements) {
      alert(
        "Ada transfer yang sudah ditandai Lunas. Batalkan status lunas terlebih dahulu sebelum menghapus pengeluaran."
      );
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus pengeluaran "${title}"?`)) {
      startTransition(async () => {
        const res = await deleteExpenseAction(expenseId, eventId);
        if (res?.error) {
          alert(res.error);
        }
      });
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="card-diskon p-8 text-center text-slate-500 bg-white">
        <p className="text-sm">Belum ada pengeluaran yang dicatat untuk event ini.</p>
        {isOwner && members.length >= 2 && (
          <div className="mt-3">
            <ExpenseFormDialog
              eventId={eventId}
              members={members}
              hasPaidSettlements={hasPaidSettlements}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasPaidSettlements && isOwner && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            Pengeluaran dikunci karena ada transfer yang sudah ditandai Lunas. Batalkan status lunas
            untuk mengedit atau menghapus.
          </span>
        </div>
      )}

      <div className="card-diskon divide-y divide-slate-100 overflow-hidden border border-slate-200">
        {expenses.map((exp) => (
          <div
            key={exp.id}
            className="p-3 sm:p-4 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <h5 className="text-xs sm:text-base font-semibold text-slate-900 truncate">
                {exp.title}
              </h5>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                <span className="truncate">Oleh <strong className="text-slate-700 font-semibold">{exp.paidByMember?.name || "Peserta"}</strong></span>
                <span>•</span>
                <span className="shrink-0">
                  {new Date(exp.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <span className="font-mono-numbers font-bold text-xs sm:text-base text-slate-950">
                {formatRupiah(exp.amount)}
              </span>

              {isOwner && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <ExpenseFormDialog
                    eventId={eventId}
                    members={members}
                    hasPaidSettlements={hasPaidSettlements}
                    expenseToEdit={exp}
                  />

                  <button
                    onClick={() => handleDelete(exp.id, exp.title)}
                    disabled={isPending || hasPaidSettlements}
                    className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-40"
                    title={
                      hasPaidSettlements
                        ? "Batal status lunas untuk menghapus"
                        : "Hapus Pengeluaran"
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
