"use client";

import { formatRupiah } from "../lib/money";
import { Users, Receipt, CreditCard, CheckCircle2 } from "lucide-react";

interface SummaryCardsProps {
  totalAmount: bigint;
  memberCount: number;
  baseShare: bigint;
  remainder: bigint;
  totalSettlements: number;
  unpaidSettlements: number;
}

export function SummaryCards({
  totalAmount,
  memberCount,
  baseShare,
  remainder,
  totalSettlements,
  unpaidSettlements,
}: SummaryCardsProps) {
  const paidCount = totalSettlements - unpaidSettlements;
  const isAllPaid = totalSettlements > 0 && unpaidSettlements === 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Pengeluaran */}
      <div className="card-diskon p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs sm:text-sm font-medium">Total Biaya</span>
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-slate-950">
            {formatRupiah(totalAmount)}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Total seluruh pengeluaran
          </p>
        </div>
      </div>

      {/* Jumlah Peserta */}
      <div className="card-diskon p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs sm:text-sm font-medium">Peserta</span>
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-slate-950">
            {memberCount} <span className="text-sm font-normal text-slate-500">orang</span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            {memberCount < 2 ? "Perlu min. 2 peserta" : "Semua peserta aktif"}
          </p>
        </div>
      </div>

      {/* Beban per Orang */}
      <div className="card-diskon p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs sm:text-sm font-medium">Jatah per Orang</span>
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-slate-950">
            {memberCount > 0 ? formatRupiah(baseShare) : "Rp 0"}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            {remainder > BigInt(0)
              ? `+Rp 1 untuk ${remainder} orang pertama`
              : "Dibagi rata tanpa sisa"}
          </p>
        </div>
      </div>

      {/* Progress Pelunasan */}
      <div
        className={`card-diskon p-4 sm:p-5 flex flex-col justify-between border-2 transition-all ${
          isAllPaid
            ? "border-emerald-400 bg-emerald-50/50"
            : "border-transparent"
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs sm:text-sm font-medium">Pelunasan</span>
          <div
            className={`p-2 rounded-xl ${
              isAllPaid
                ? "bg-emerald-500 text-white"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-slate-950">
            {totalSettlements === 0 ? (
              <span className="text-sm font-semibold text-slate-600">Sudah Impas ✨</span>
            ) : isAllPaid ? (
              <span className="text-emerald-700">100% Lunas</span>
            ) : (
              <span>
                {paidCount} / {totalSettlements}{" "}
                <span className="text-xs font-normal text-slate-500">selesai</span>
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            {totalSettlements === 0
              ? "Tidak ada utang piutang"
              : unpaidSettlements === 0
              ? "Semua transfer telah diselesaikan"
              : `Sisa ${unpaidSettlements} transfer tertunda`}
          </p>
        </div>
      </div>
    </div>
  );
}
