"use client";

import { useState, useTransition } from "react";
import { formatRupiah } from "../lib/money";
import { toggleSettlementPaidAction } from "../server/actions/settlement";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface SettlementItem {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  fromMemberName: string;
  toMemberName: string;
  amount: bigint;
  isPaid: boolean;
  paidAt?: Date | string | null;
}

interface SettlementListProps {
  eventId: string;
  settlements: SettlementItem[];
  isOwner: boolean;
}

export function SettlementList({
  eventId,
  settlements: initialSettlements,
  isOwner,
}: SettlementListProps) {
  const [settlements, setSettlements] = useState(initialSettlements);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (settlementId: string) => {
    if (!isOwner) return;

    // Optimistic update
    let nowAllPaid = false;
    setSettlements((prev) => {
      const updated = prev.map((s) => {
        if (s.id === settlementId) {
          const nextPaid = !s.isPaid;
          return {
            ...s,
            isPaid: nextPaid,
            paidAt: nextPaid ? new Date() : null,
          };
        }
        return s;
      });

      nowAllPaid = updated.length > 0 && updated.every((s) => s.isPaid);
      return updated;
    });

    if (nowAllPaid) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    startTransition(async () => {
      try {
        await toggleSettlementPaidAction(settlementId, eventId);
      } catch (err) {
        console.error("Failed to toggle settlement status:", err);
        // Revert on error
        setSettlements(initialSettlements);
      }
    });
  };

  if (settlements.length === 0) {
    return (
      <div className="card-diskon p-8 text-center bg-white">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900">Semua Saldo Sudah Impas</h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Tidak ada instruksi transfer pelunasan yang diperlukan saat ini.
        </p>
      </div>
    );
  }

  const allPaid = settlements.every((s) => s.isPaid);

  return (
    <div className="space-y-3">
      {allPaid && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">
            Luar biasa! Seluruh transfer pelunasan telah ditandai Lunas. 🥳
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {settlements.map((item, idx) => {
          return (
            <div
              key={item.id || idx}
              className={`card-diskon p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                item.isPaid
                  ? "bg-slate-50/80 border-slate-200 opacity-90"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Transfer Details */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm sm:text-base text-slate-950">
                    {item.fromMemberName}
                  </span>
                  <div className="flex items-center text-slate-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-slate-950">
                    {item.toMemberName}
                  </span>
                </div>

                <div className="font-mono-numbers font-bold text-base sm:text-lg text-slate-900 ml-auto sm:ml-4">
                  {formatRupiah(item.amount)}
                </div>
              </div>

              {/* Action / Status Badge */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {item.paidAt && (
                  <span className="text-[11px] text-slate-400 hidden md:inline-block">
                    {new Date(item.paidAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}

                {isOwner ? (
                  <button
                    onClick={() => handleToggle(item.id)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                      item.isPaid
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                    }`}
                    title="Klik untuk mengubah status lunas"
                  >
                    {item.isPaid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Lunas</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-amber-700" />
                        <span>Tandai Lunas</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      item.isPaid
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.isPaid ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Lunas</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>Belum Lunas</span>
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
