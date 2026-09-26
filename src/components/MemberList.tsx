"use client";

import { useTransition } from "react";
import { deleteMemberAction } from "../server/actions/member";
import { MemberFormDialog } from "./MemberFormDialog";
import { Trash2, User, AlertCircle } from "lucide-react";

interface MemberItem {
  id: string;
  name: string;
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
            peserta bila ada salah ketik.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((member, idx) => (
          <div
            key={member.id}
            className="card-diskon p-4 flex items-center justify-between gap-3 bg-white"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[#b7e913] text-xs font-bold shrink-0">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-sm text-slate-900 block truncate">
                  {member.name}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Peserta #{idx + 1}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-1">
                <MemberFormDialog
                  eventId={eventId}
                  expenseCount={expenseCount}
                  memberToEdit={member}
                />

                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  disabled={isPending || expenseCount > 0}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  title={
                    expenseCount > 0
                      ? "Tidak dapat dihapus karena sudah ada pengeluaran"
                      : "Hapus Peserta"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
