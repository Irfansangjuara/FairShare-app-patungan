"use client";

import { useState, useTransition } from "react";
import { deleteMemberAction } from "../server/actions/member";
import { MemberFormDialog } from "./MemberFormDialog";
import { Trash2, CreditCard, AlertCircle, Copy, Check } from "lucide-react";

interface MemberItem {
  id: string;
  name: string;
  bankAccount?: string | null;
  createdAt: Date | string;
}

interface MemberListProps {
  eventId: string;
  members: MemberItem[];
  expenseCount: number;
  isOwner: boolean;
}

export function MemberList({
  eventId,
  members,
  expenseCount,
  isOwner,
}: MemberListProps) {
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (memberId: string, name: string) => {
    if (expenseCount > 0) {
      alert(
        "Peserta tidak dapat dihapus setelah pengeluaran dicatat (Aturan MVP: menjaga integritas perhitungan). Anda dapat menghapus pengeluaran terlebih dahulu jika ingin menghapus peserta."
      );
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus peserta "${name}"?`)) {
      startTransition(async () => {
        const res = await deleteMemberAction(memberId, eventId);
        if (res?.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <div className="space-y-3">
      {expenseCount > 0 && isOwner && (
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
          <span>
            Daftar peserta dikunci karena pengeluaran sudah dicatat. Anda tetap dapat mengedit nama
            atau nomor rekening peserta.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {members.map((member, idx) => (
          <div
            key={member.id}
            className="card-diskon p-3 sm:p-4 flex flex-col justify-between gap-2 bg-white"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black text-[#b7e913] text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 block truncate">
                    {member.name}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block">
                    Peserta #{idx + 1}
                  </span>
                </div>
              </div>

              {isOwner && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <MemberFormDialog
                    eventId={eventId}
                    expenseCount={expenseCount}
                    memberToEdit={member}
                  />

                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    disabled={isPending || expenseCount > 0}
                    className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    title={
                      expenseCount > 0
                        ? "Tidak dapat dihapus karena sudah ada pengeluaran"
                        : "Hapus Peserta"
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Nomor Rekening Display */}
            {member.bankAccount ? (
              <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono truncate">{member.bankAccount}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(member.id, member.bankAccount!)}
                  className="text-slate-400 hover:text-slate-800 shrink-0 p-0.5"
                  title="Salin nomor rekening"
                >
                  {copiedId === member.id ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-1 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 italic">
                Belum ada nomor rekening
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
