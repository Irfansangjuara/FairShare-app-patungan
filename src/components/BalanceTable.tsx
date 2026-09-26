"use client";

import { formatRupiah, formatRupiahWithSign } from "../lib/money";
import { MemberCalculation } from "../lib/settlement";
import { ArrowDownLeft, ArrowUpRight, Minus } from "lucide-react";

interface BalanceTableProps {
  calculations: MemberCalculation[];
}

export function BalanceTable({ calculations }: BalanceTableProps) {
  if (calculations.length === 0) {
    return (
      <div className="card-diskon p-6 text-center text-slate-500 text-sm">
        Belum ada data saldo peserta.
      </div>
    );
  }

  return (
    <div className="card-diskon overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-3 px-4 sm:px-6">Peserta</th>
              <th className="py-3 px-4 sm:px-6 text-right">Sudah Bayar</th>
              <th className="py-3 px-4 sm:px-6 text-right">Jatah Beban</th>
              <th className="py-3 px-4 sm:px-6 text-right">Saldo Bersih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {calculations.map((member) => {
              const isSurplus = member.balance > BigInt(0);
              const isDebt = member.balance < BigInt(0);

              return (
                <tr key={member.memberId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                    {member.name}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-mono-numbers text-slate-700">
                    {formatRupiah(member.paid)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-mono-numbers text-slate-700">
                    {formatRupiah(member.share)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-mono-numbers font-bold px-2.5 py-1 rounded-full text-xs ${
                        isSurplus
                          ? "bg-emerald-100 text-emerald-800"
                          : isDebt
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isSurplus && <ArrowDownLeft className="h-3 w-3" />}
                      {isDebt && <ArrowUpRight className="h-3 w-3" />}
                      {!isSurplus && !isDebt && <Minus className="h-3 w-3" />}
                      {formatRupiahWithSign(member.balance)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
