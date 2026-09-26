import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSplitAndSettlements,
  generateWhatsAppRecap,
} from "../../src/lib/settlement.ts";
import { formatRupiah, formatRupiahWithSign, parseRupiahInput } from "../../src/lib/money.ts";

describe("Money formatting", () => {
  it("formats positive, zero, and negative rupiah correctly", () => {
    assert.equal(formatRupiah(934000n), "Rp 934.000");
    assert.equal(formatRupiah(0n), "Rp 0");
    assert.equal(formatRupiah(-33500n), "-Rp 33.500");
    assert.equal(formatRupiahWithSign(151500n), "+Rp 151.500");
    assert.equal(formatRupiahWithSign(-168500n), "-Rp 168.500");
  });

  it("parses rupiah user input properly", () => {
    assert.equal(parseRupiahInput("Rp 934.000"), 934000n);
    assert.equal(parseRupiahInput("125.000"), 125000n);
    assert.equal(parseRupiahInput("abc"), 0n);
  });
});

describe("Settlement Engine & PRD Requirements", () => {
  it("handles empty expenses (0 pengeluaran)", () => {
    const members = [
      { id: "1", name: "Alice", createdAt: new Date("2026-01-01") },
      { id: "2", name: "Bob", createdAt: new Date("2026-01-02") },
    ];
    const result = calculateSplitAndSettlements(members, []);
    assert.equal(result.totalAmount, 0n);
    assert.equal(result.settlements.length, 0);
    assert.equal(result.memberCalculations.every((m) => m.balance === 0n), true);
  });

  it("handles remainder deterministic allocation (Rp 100 divided by 3 members)", () => {
    const members = [
      { id: "m1", name: "User A", createdAt: new Date("2026-01-01T00:00:00Z") },
      { id: "m2", name: "User B", createdAt: new Date("2026-01-01T00:01:00Z") },
      { id: "m3", name: "User C", createdAt: new Date("2026-01-01T00:02:00Z") },
    ];
    const expenses = [
      { id: "e1", paidByMemberId: "m1", amount: 100n, title: "Snack" },
    ];
    const result = calculateSplitAndSettlements(members, expenses);

    assert.equal(result.totalAmount, 100n);
    assert.equal(result.baseShare, 33n);
    assert.equal(result.remainder, 1n);

    // First member gets base + 1 = 34, others get 33
    const shareA = result.memberCalculations.find((m) => m.memberId === "m1")?.share;
    const shareB = result.memberCalculations.find((m) => m.memberId === "m2")?.share;
    const shareC = result.memberCalculations.find((m) => m.memberId === "m3")?.share;

    assert.equal(shareA, 34n);
    assert.equal(shareB, 33n);
    assert.equal(shareC, 33n);

    // Sum of shares == total
    assert.equal((shareA || 0n) + (shareB || 0n) + (shareC || 0n), 100n);

    // Total settlements settle all debts
    const totalTransferred = result.settlements.reduce((sum, s) => sum + s.amount, 0n);
    assert.equal(totalTransferred, 66n);
  });

  it("handles PRD Section 8 benchmark: 4 participants, total Rp 934.000", () => {
    const members = [
      { id: "m-andri", name: "Andri", createdAt: new Date("2026-01-01T01:00:00Z") },
      { id: "m-tedy", name: "Tedy", createdAt: new Date("2026-01-01T02:00:00Z") },
      { id: "m-irfan", name: "Irfan", createdAt: new Date("2026-01-01T03:00:00Z") },
      { id: "m-rion", name: "Rion", createdAt: new Date("2026-01-01T04:00:00Z") },
    ];

    const expenses = [
      { id: "e1", paidByMemberId: "m-andri", amount: 385000n, title: "Penginapan" },
      { id: "e2", paidByMemberId: "m-tedy", amount: 284000n, title: "Makan Siang" },
      { id: "e3", paidByMemberId: "m-irfan", amount: 200000n, title: "Bensin" },
      { id: "e4", paidByMemberId: "m-rion", amount: 65000n, title: "Kopi" },
    ];

    const result = calculateSplitAndSettlements(members, expenses);

    assert.equal(result.totalAmount, 934000n);
    assert.equal(result.baseShare, 233500n);
    assert.equal(result.remainder, 0n);

    // Balances check
    const andri = result.memberCalculations.find((m) => m.name === "Andri");
    const tedy = result.memberCalculations.find((m) => m.name === "Tedy");
    const irfan = result.memberCalculations.find((m) => m.name === "Irfan");
    const rion = result.memberCalculations.find((m) => m.name === "Rion");

    assert.equal(andri?.balance, 151500n);
    assert.equal(tedy?.balance, 50500n);
    assert.equal(irfan?.balance, -33500n);
    assert.equal(rion?.balance, -168500n);

    // Settlements must fully clear the net balances
    assert.ok(result.settlements.length > 0);
    for (const s of result.settlements) {
      assert.ok(s.amount > 0n);
      assert.notEqual(s.fromMemberId, s.toMemberId);
    }

    // Verify all debts and credits balance out to zero
    const netAfterTransfers = new Map<string, bigint>();
    for (const m of result.memberCalculations) {
      netAfterTransfers.set(m.memberId, m.balance);
    }
    for (const s of result.settlements) {
      netAfterTransfers.set(
        s.fromMemberId,
        (netAfterTransfers.get(s.fromMemberId) || 0n) + s.amount
      );
      netAfterTransfers.set(
        s.toMemberId,
        (netAfterTransfers.get(s.toMemberId) || 0n) - s.amount
      );
    }

    for (const [, finalBal] of netAfterTransfers.entries()) {
      assert.equal(finalBal, 0n);
    }
  });

  it("generates WhatsApp recap properly", () => {
    const recap = generateWhatsAppRecap({
      eventTitle: "Trip Jogja",
      eventLocation: "Malioboro",
      eventDate: "2026-09-26",
      memberCount: 2,
      totalAmount: 200000n,
      memberCalculations: [
        { memberId: "1", name: "Andi", paid: 200000n, share: 100000n, balance: 100000n },
        { memberId: "2", name: "Budi", paid: 0n, share: 100000n, balance: -100000n },
      ],
      settlementsWithStatus: [
        { fromName: "Budi", toName: "Andi", amount: 100000n, isPaid: false },
      ],
    });

    assert.ok(recap.includes("TRIP JOGJA"));
    assert.ok(recap.includes("Rp 200.000"));
    assert.ok(recap.includes("Budi ➡️ Andi: *Rp 100.000*"));
    assert.ok(recap.includes("⏳ *[BELUM LUNAS]*"));
  });
});
