import { getEventByShareToken } from "../../../server/queries";
import { notFound } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { SummaryCards } from "../../../components/SummaryCards";
import { SettlementList } from "../../../components/SettlementList";
import { BalanceTable } from "../../../components/BalanceTable";
import { ExpenseList } from "../../../components/ExpenseList";
import { MemberList } from "../../../components/MemberList";
import { WhatsAppRecapButton } from "../../../components/WhatsAppRecapButton";
import { generateWhatsAppRecap } from "../../../lib/settlement";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Receipt,
  ArrowRightLeft,
  PieChart,
  Shield,
  Wallet,
} from "lucide-react";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const eventData = await getEventByShareToken(token);

  if (!eventData) {
    notFound();
  }

  const { event, splitResult, unpaidCount } = eventData;

  const memberMap = new Map(event.members.map((m) => [m.id, m.name]));
  const settlementsWithStatus = event.settlements.map((s) => ({
    id: s.id,
    fromMemberId: s.fromMemberId,
    toMemberId: s.toMemberId,
    fromMemberName: memberMap.get(s.fromMemberId) || "Peserta",
    toMemberName: memberMap.get(s.toMemberId) || "Peserta",
    amount: s.amount,
    isPaid: s.isPaid,
    paidAt: s.paidAt,
  }));

  const recapText = generateWhatsAppRecap({
    eventTitle: event.title,
    eventLocation: event.location,
    eventDate: event.eventDate,
    memberCount: event.members.length,
    totalAmount: splitResult.totalAmount,
    memberCalculations: splitResult.memberCalculations,
    settlementsWithStatus: settlementsWithStatus.map((s) => ({
      fromName: s.fromMemberName,
      toName: s.toMemberName,
      amount: s.amount,
      isPaid: s.isPaid,
    })),
  });

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      {/* Read-only banner header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black text-[#b7e913] shadow-md">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">FairShare</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span>Tautan Baca-Saja (Publik)</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Event Title & Details */}
        <div className="card-diskon p-6 bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Diselenggarakan oleh {event.owner?.name || "Pengelola"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              {event.title}
            </h1>

            {(event.location || event.eventDate) && (
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 pt-1">
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{event.eventDate}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <WhatsAppRecapButton recapText={recapText} />
        </div>

        {/* Overview Metric Cards */}
        <SummaryCards
          totalAmount={splitResult.totalAmount}
          memberCount={event.members.length}
          baseShare={splitResult.baseShare}
          remainder={splitResult.remainder}
          totalSettlements={settlementsWithStatus.length}
          unpaidSettlements={unpaidCount}
        />

        {/* Section 1: Rencana Pelunasan */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-slate-900 text-[#b7e913]">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Rencana Pelunasan Transfer
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Status Pembayaran</span>
          </div>

          <SettlementList
            eventId={event.id}
            settlements={settlementsWithStatus}
            isOwner={false}
          />
        </div>

        {/* Section 2: Rincian Saldo Peserta */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                <PieChart className="h-4 w-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Rincian Saldo Peserta
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {splitResult.memberCalculations.length} Peserta
            </span>
          </div>

          <BalanceTable calculations={splitResult.memberCalculations} />
        </div>

        {/* Section 3: Catatan Pengeluaran & Peserta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                <Receipt className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Pengeluaran</h2>
            </div>

            <ExpenseList
              eventId={event.id}
              expenses={event.expenses}
              members={event.members}
              hasPaidSettlements={false}
              isOwner={false}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Peserta Event</h2>
            </div>

            <MemberList
              eventId={event.id}
              members={event.members}
              expenseCount={event.expenses.length}
              isOwner={false}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <p>FairShare — Bagikan patungan dengan adil dan transparan</p>
      </footer>
    </div>
  );
}
