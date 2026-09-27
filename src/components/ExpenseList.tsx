"use client";

import { useState, useTransition, useMemo } from "react";
import { formatRupiah } from "../lib/money";
import { deleteExpenseAction } from "../server/actions/expense";
import { ExpenseFormDialog } from "./ExpenseFormDialog";
import { Trash2, AlertCircle, Filter, Search, Tag } from "lucide-react";

interface ExpenseItem {
  id: string;
  title: string;
  category?: string | null;
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat =
        selectedCategory === "Semua" || (e.category || "Umum") === selectedCategory;
      const matchQuery =
        !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.paidByMember?.name &&
          e.paidByMember.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [expenses, selectedCategory, searchQuery]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, BigInt(0));
  }, [filteredExpenses]);

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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengeluaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>

        {/* Categories Chips */}
        {categories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-[#b7e913]"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtered stats header if filtering is active */}
      {(selectedCategory !== "Semua" || searchQuery) && (
        <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
          <span>Menampilkan {filteredExpenses.length} dari {expenses.length} pengeluaran</span>
          <span className="font-semibold text-slate-800 font-mono-numbers">
            Subtotal: {formatRupiah(filteredTotal)}
          </span>
        </div>
      )}

      <div className="card-diskon divide-y divide-slate-100 overflow-hidden border border-slate-200">
        {filteredExpenses.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Tidak ada pengeluaran yang cocok dengan filter.
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-3 sm:p-4 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="text-xs sm:text-base font-semibold text-slate-900 truncate">
                    {exp.title}
                  </h5>
                  {exp.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                      <Tag className="h-2.5 w-2.5 text-slate-400" />
                      <span>{exp.category}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
                  <span className="truncate">
                    Oleh <strong className="text-slate-700 font-semibold">{exp.paidByMember?.name || "Peserta"}</strong>
                  </span>
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
          ))
        )}
      </div>
    </div>
  );
}
