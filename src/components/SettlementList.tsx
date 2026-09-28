"use client";

import { useState, useTransition } from "react";
import { formatRupiah } from "../lib/money";
import { toggleSettlementPaidAction } from "../server/actions/settlement";
import { ArrowRight, CheckCircle2, Clock, Scale, CreditCard, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";

export interface SettlementItem {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  fromMemberName: string;
  toMemberName: string;
  toMemberBankAccount?: string | null;
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
  // The server list is the source of truth. Local state exists only so a
  // "Tandai Lunas" click feels instant; it must resynchronise whenever the
  // server sends a different list (e.g. after an expense is added, which
  // rebuilds the settlement plan and revalidates this page).
  const serverSignature = initialSettlements
    .map((settlement) => `${settlement.id}:${settlement.isPaid ? 1 : 0}`)
    .join("|");

  const [state, setState] = useState({
    signature: serverSignature,
    items: initialSettlements,
  });

  if (state.signature !== serverSignature) {
    setState({ signature: serverSignature, items: initialSettlements });
  }

  const settlements = state.signature === serverSignature ? state.items : initialSettlements;
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = (settlementId: string) => {
    if (!isOwner) return;

    // Optimistic update
    const updated = settlements.map((s) => {
      if (s.id !== settlementId) return s;
      const nextPaid = !s.isPaid;
      return { ...s, isPaid: nextPaid, paidAt: nextPaid ? new Date() : null };
    });

    setState({ signature: serverSignature, items: updated });

    const nowAllPaid = updated.length > 0 && updated.every((s) => s.isPaid);
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
        setState({ signature: serverSignature, items: initialSettlements });
      }
    });
  };

  if (settlements.length === 0) {
    return (
      <div className="card-diskon p-8 text-center bg-white">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
          <Scale className="h-6 w-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900">Semua Saldo Sudah Impas</h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Tidak ada instruksi transfer pelunasan yang diperlukan saat ini. Seluruh beban telah seimbang.
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
              className={`card-diskon p-3.5 sm:p-5 flex flex-col gap-3 transition-all ${
                item.isPaid
                  ? "bg-slate-50/80 border-slate-200 opacity-90"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Transfer Header / Route */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 shrink-0">
                    {idx + 1}
                  </span>

                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    <span className="font-semibold text-xs sm:text-base text-slate-950 truncate max-w-[110px] sm:max-w-none">
                      {item.fromMemberName}
                    </span>
                    <div className="flex items-center text-slate-400 shrink-0">
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <span className="font-semibold text-xs sm:text-base text-slate-950 truncate max-w-[110px] sm:max-w-none">
                      {item.toMemberName}
                    </span>
                  </div>

                  {/* Amount on desktop / tablet */}
                  <div className="hidden sm:block font-mono-numbers font-bold text-base sm:text-lg text-slate-900 ml-auto sm:ml-4 shrink-0">
                    {formatRupiah(item.amount)}
                  </div>
                </div>

                {/* Mobile amount & Action / Status Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Amount visible on mobile */}
                  <div className="sm:hidden font-mono-numbers font-bold text-sm text-slate-950">
                    {formatRupiah(item.amount)}
                  </div>

                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    {item.paidAt && (
                      <span className="text-[10px] sm:text-[11px] text-slate-400 hidden md:inline-block">
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
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                          item.isPaid
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                        }`}
                        title="Klik untuk mengubah status lunas"
                      >
                        {item.isPaid ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Lunas</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-700" />
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
              </div>

              {/* Destination Bank Account Card */}
              {item.toMemberBankAccount && (
                <div className="flex items-center justify-between gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <CreditCard className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="text-[11px] sm:text-xs text-slate-500">Rekening Tujuan ({item.toMemberName}):</span>
                    <span className="font-mono font-medium truncate text-[11px] sm:text-xs text-slate-900">
                      {item.toMemberBankAccount}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.toMemberBankAccount!)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-950 bg-white border border-slate-300 hover:bg-slate-100 px-2 py-0.5 rounded-md shrink-0 shadow-2xs transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
