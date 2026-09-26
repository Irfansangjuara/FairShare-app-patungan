export interface MemberData {
  id: string;
  name: string;
  createdAt: Date | string;
}

export interface ExpenseData {
  id: string;
  paidByMemberId: string;
  amount: bigint;
  title: string;
}

export interface MemberCalculation {
  memberId: string;
  name: string;
  paid: bigint;
  share: bigint;
  balance: bigint; // positive = credit (gets money back), negative = debt (must pay)
}

export interface SettlementRecommendation {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: bigint;
}

export interface SplitResult {
  totalAmount: bigint;
  memberCount: number;
  baseShare: bigint;
  remainder: bigint;
  memberCalculations: MemberCalculation[];
  settlements: SettlementRecommendation[];
}

const ZERO = BigInt(0);
const ONE = BigInt(1);

/**
 * Calculates fair split and deterministic greedy settlements based on PRD FR-04 and FR-05
 */
export function calculateSplitAndSettlements(
  members: MemberData[],
  expenses: ExpenseData[]
): SplitResult {
  const memberCount = members.length;
  if (memberCount === 0) {
    return {
      totalAmount: ZERO,
      memberCount: 0,
      baseShare: ZERO,
      remainder: ZERO,
      memberCalculations: [],
      settlements: [],
    };
  }

  // Calculate total expense
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, ZERO);

  if (memberCount < 2) {
    // PRD: minimum 2 members to calculate settlements
    const paidMap = new Map<string, bigint>();
    for (const exp of expenses) {
      paidMap.set(exp.paidByMemberId, (paidMap.get(exp.paidByMemberId) || ZERO) + exp.amount);
    }
    const memberCalculations: MemberCalculation[] = members.map((m) => {
      const paid = paidMap.get(m.id) || ZERO;
      return {
        memberId: m.id,
        name: m.name,
        paid,
        share: totalAmount,
        balance: paid - totalAmount,
      };
    });
    return {
      totalAmount,
      memberCount,
      baseShare: totalAmount,
      remainder: ZERO,
      memberCalculations,
      settlements: [],
    };
  }

  // Calculate base share and remainder
  const countBigInt = BigInt(memberCount);
  const baseShare = totalAmount / countBigInt;
  const remainder = totalAmount % countBigInt;

  // Sort members for remainder allocation: createdAt ASC, then id ASC
  const sortedForRemainder = [...members].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.id.localeCompare(b.id);
  });

  // Calculate paid per member
  const paidMap = new Map<string, bigint>();
  for (const exp of expenses) {
    paidMap.set(exp.paidByMemberId, (paidMap.get(exp.paidByMemberId) || ZERO) + exp.amount);
  }

  // Distribute remainder: first `remainder` members get base + ONE
  const shareMap = new Map<string, bigint>();
  const remainderCount = Number(remainder);
  for (let i = 0; i < sortedForRemainder.length; i++) {
    const member = sortedForRemainder[i];
    const share = i < remainderCount ? baseShare + ONE : baseShare;
    shareMap.set(member.id, share);
  }

  // Member calculations
  const memberCalculations: MemberCalculation[] = sortedForRemainder.map((m) => {
    const paid = paidMap.get(m.id) || ZERO;
    const share = shareMap.get(m.id) || ZERO;
    return {
      memberId: m.id,
      name: m.name,
      paid,
      share,
      balance: paid - share,
    };
  });

  // Verification invariants
  // 1. sum of shares == totalAmount
  // 2. sum of balances == ZERO
  const totalShares = memberCalculations.reduce((sum, m) => sum + m.share, ZERO);
  const totalBalances = memberCalculations.reduce((sum, m) => sum + m.balance, ZERO);
  if (totalShares !== totalAmount) {
    throw new Error(`Invariance violation: totalShares (${totalShares}) != totalAmount (${totalAmount})`);
  }
  if (totalBalances !== ZERO) {
    throw new Error(`Invariance violation: totalBalances (${totalBalances}) != 0`);
  }

  // FR-05: Greedy Deterministic Settlement
  // Debtors: balance < ZERO (owes money), debt = -balance
  // Creditors: balance > ZERO (receives money), credit = balance
  type Debtor = { id: string; name: string; debt: bigint };
  type Creditor = { id: string; name: string; credit: bigint };

  const debtors: Debtor[] = memberCalculations
    .filter((m) => m.balance < ZERO)
    .map((m) => ({ id: m.memberId, name: m.name, debt: -m.balance }));

  const creditors: Creditor[] = memberCalculations
    .filter((m) => m.balance > ZERO)
    .map((m) => ({ id: m.memberId, name: m.name, credit: m.balance }));

  const sortDebtors = (list: Debtor[]) => {
    list.sort((a, b) => {
      if (b.debt !== a.debt) return b.debt > a.debt ? 1 : -1;
      return a.id.localeCompare(b.id);
    });
  };

  const sortCreditors = (list: Creditor[]) => {
    list.sort((a, b) => {
      if (b.credit !== a.credit) return b.credit > a.credit ? 1 : -1;
      return a.id.localeCompare(b.id);
    });
  };

  sortDebtors(debtors);
  sortCreditors(creditors);

  const settlements: SettlementRecommendation[] = [];

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    // Transfer amount is min(debtor's remaining debt, creditor's remaining credit)
    const transferAmount = debtor.debt < creditor.credit ? debtor.debt : creditor.credit;

    if (transferAmount > ZERO && debtor.id !== creditor.id) {
      settlements.push({
        fromMemberId: debtor.id,
        fromMemberName: debtor.name,
        toMemberId: creditor.id,
        toMemberName: creditor.name,
        amount: transferAmount,
      });
    }

    debtor.debt -= transferAmount;
    creditor.credit -= transferAmount;

    if (debtor.debt === ZERO) {
      debtors.shift();
    } else {
      sortDebtors(debtors);
    }

    if (creditor.credit === ZERO) {
      creditors.shift();
    } else {
      sortCreditors(creditors);
    }
  }

  return {
    totalAmount,
    memberCount,
    baseShare,
    remainder,
    memberCalculations,
    settlements,
  };
}

/**
 * Generates WhatsApp-ready clean text recap based on FR-07
 */
export function generateWhatsAppRecap({
  eventTitle,
  eventLocation,
  eventDate,
  memberCount,
  totalAmount,
  memberCalculations,
  settlementsWithStatus,
}: {
  eventTitle: string;
  eventLocation?: string | null;
  eventDate?: string | null;
  memberCount: number;
  totalAmount: bigint;
  memberCalculations: MemberCalculation[];
  settlementsWithStatus: Array<{
    fromName: string;
    toName: string;
    amount: bigint;
    isPaid: boolean;
  }>;
}): string {
  const formatRp = (amt: bigint) => {
    const isNeg = amt < ZERO;
    const abs = isNeg ? -amt : amt;
    const str = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return isNeg ? `-Rp ${str}` : `Rp ${str}`;
  };

  const lines: string[] = [];
  lines.push(`*REKAP PATUNGAN — ${eventTitle.toUpperCase()}*`);
  
  if (eventDate || eventLocation) {
    const metaParts = [];
    if (eventDate) metaParts.push(`📅 ${eventDate}`);
    if (eventLocation) metaParts.push(`📍 ${eventLocation}`);
    lines.push(metaParts.join(" | "));
  }
  
  lines.push("");
  lines.push(`💰 *Total Pengeluaran:* ${formatRp(totalAmount)}`);
  lines.push(`👥 *Jumlah Peserta:* ${memberCount} orang`);
  
  // Base share
  if (memberCount > 0) {
    const baseShare = totalAmount / BigInt(memberCount);
    const remainder = totalAmount % BigInt(memberCount);
    if (remainder === ZERO) {
      lines.push(`⚖️ *Beban per Orang:* ${formatRp(baseShare)}`);
    } else {
      lines.push(
        `⚖️ *Beban per Orang:* ${formatRp(baseShare)} (+Rp 1 untuk ${remainder} orang pertama)`
      );
    }
  }

  lines.push("");
  lines.push(`📊 *RINGKASAN SALDO:*`);
  for (const m of memberCalculations) {
    const paidStr = formatRp(m.paid);
    const balanceStr =
      m.balance > ZERO
        ? `+${formatRp(m.balance)} (menerima)`
        : m.balance < ZERO
        ? `${formatRp(m.balance)} (membayar)`
        : `Rp 0 (impas)`;
    lines.push(`• *${m.name}*: Bayar ${paidStr} | Saldo: ${balanceStr}`);
  }

  lines.push("");
  lines.push(`💸 *INSTRUKSI TRANSFER PELUNASAN:*`);
  if (settlementsWithStatus.length === 0) {
    lines.push(`_Semua peserta sudah impas! Tidak ada transfer yang diperlukan._`);
  } else {
    for (let i = 0; i < settlementsWithStatus.length; i++) {
      const s = settlementsWithStatus[i];
      const statusIcon = s.isPaid ? "✅ *[LUNAS]*" : "⏳ *[BELUM LUNAS]*";
      lines.push(
        `${i + 1}. ${s.fromName} ➡️ ${s.toName}: *${formatRp(s.amount)}* — ${statusIcon}`
      );
    }
  }

  lines.push("");
  lines.push(`_Dihitung otomatis & akurat via FairShare_`);

  return lines.join("\n");
}

