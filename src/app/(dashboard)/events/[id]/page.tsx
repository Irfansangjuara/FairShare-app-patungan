import { getSessionUser } from "../../../../lib/auth";
import { getEventDetails } from "../../../../server/queries";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "../../../../components/Navbar";
import { SummaryCards } from "../../../../components/SummaryCards";
import { SettlementList } from "../../../../components/SettlementList";
import { BalanceTable } from "../../../../components/BalanceTable";
import { ExpenseList } from "../../../../components/ExpenseList";
import { MemberList } from "../../../../components/MemberList";
import { WhatsAppRecapButton } from "../../../../components/WhatsAppRecapButton";
import { ShareLinkButton } from "../../../../components/ShareLinkButton";
import { EventSettingsDialog } from "../../../../components/EventSettingsDialog";
import { MemberFormDialog } from "../../../../components/MemberFormDialog";
import { ExpenseFormDialog } from "../../../../components/ExpenseFormDialog";
import { generateWhatsAppRecap } from "../../../../lib/settlement";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Receipt,
  ArrowRightLeft,
  PieChart,
  UserPlus,
  Plus,
  AlertTriangle,
} from "lucide-react";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { id: eventId } = await params;
  const eventData = await getEventDetails(eventId, user.id);

  if (!eventData) {
    notFound();
  }

  const { event, splitResult, hasPaidSettlements, unpaidCount } = eventData;

  // Prepare map for settlement items with member names and paid status
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

  // WhatsApp recap text
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
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Dashboard</span>
            </Link>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                {event.title}
              </h1>
              {event.archivedAt && (
                <span className="rounded-full bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 font-bold">
                  Diarsipkan
                </span>
              )}
            </div>

            {(event.location || event.eventDate) && (
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 pt-0.5">
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

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <WhatsAppRecapButton recapText={recapText} />
            <ShareLinkButton eventId={event.id} shareToken={event.shareToken} />
            <EventSettingsDialog
              eventId={event.id}
              title={event.title}
              location={event.location}
              eventDate={event.eventDate}
              isArchived={!!event.archivedAt}
            />
          </div>
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

        {/* Warning if < 2 members */}
        {event.members.length < 2 && (
          <div className="card-diskon p-5 bg-amber-50/80 border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <h4 className="font-bold">Tambahkan minimal 2 peserta</h4>
              <p className="text-amber-800">
                Aplikasi membutuhkan minimal 2 peserta untuk membagi rata beban dan menghasilkan
                rekomendasi transfer pelunasan.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Rencana Pelunasan (Settlement Transfers) */}
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
            <span className="text-xs text-slate-500 font-medium">
              Algoritma Rute Sederhana
            </span>
          </div>

          <SettlementList
            eventId={event.id}
            settlements={settlementsWithStatus}
            isOwner={true}
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
              {splitResult.memberCalculations.length} Peserta Terdaftar
            </span>
          </div>

          <BalanceTable calculations={splitResult.memberCalculations} />
        </div>

        {/* Section 3: Catatan Pengeluaran & Peserta (Two columns on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Catatan Pengeluaran */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                  <Receipt className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Pengeluaran</h2>
              </div>

              {event.members.length >= 2 && (
                <ExpenseFormDialog
                  eventId={event.id}
                  members={event.members}
                  hasPaidSettlements={hasPaidSettlements}
                />
              )}
            </div>

            <ExpenseList
              eventId={event.id}
              expenses={event.expenses}
              members={event.members}
              hasPaidSettlements={hasPaidSettlements}
              isOwner={true}
            />
          </div>

          {/* Daftar Peserta */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Peserta Event</h2>
              </div>

              <MemberFormDialog
                eventId={event.id}
                expenseCount={event.expenses.length}
              />
            </div>

            <MemberList
              eventId={event.id}
              members={event.members}
              expenseCount={event.expenses.length}
              isOwner={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
