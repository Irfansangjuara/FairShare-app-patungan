import { test, describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateSplitAndSettlements } from "../../src/lib/settlement.ts";
import { parseRupiahInput, formatRupiah, formatRupiahWithSign } from "../../src/lib/money.ts";


describe("Mathematical and Financial Invariants Test Suite", () => {
  test("Arbitrary large numbers and remainder allocation invariant", () => {
    // 7 members, arbitrary weird amount: Rp 1.000.001
    const members = Array.from({ length: 7 }, (_, i) => ({
      id: `member-${i + 1}`,
      name: `Person ${i + 1}`,
      createdAt: new Date(Date.now() + i * 1000),
    }));

    const expenses = [
      {
        id: "exp-1",
        paidByMemberId: "member-1",
        amount: BigInt(1000001),
        title: "Large odd expense",
      },
    ];

    const result = calculateSplitAndSettlements(members, expenses);

    // Total must equal exact sum
    assert.equal(result.totalAmount, BigInt(1000001));

    // 1000001 / 7 = 142857 with remainder 2
    assert.equal(result.baseShare, BigInt(142857));
    assert.equal(result.remainder, BigInt(2));

    // First 2 members get 142858, remaining 5 get 142857
    const shareSum = result.memberCalculations.reduce((sum, m) => sum + m.share, BigInt(0));
    assert.equal(shareSum, BigInt(1000001));

    // Net balance sum must be exactly 0
    const balanceSum = result.memberCalculations.reduce((sum, m) => sum + m.balance, BigInt(0));
    assert.equal(balanceSum, BigInt(0));

    // Total settlements transferred must equal total debt
    const totalDebt = result.memberCalculations
      .filter((m) => m.balance < BigInt(0))
      .reduce((sum, m) => sum - m.balance, BigInt(0));
    const totalSettled = result.settlements.reduce((sum, s) => sum + s.amount, BigInt(0));
    assert.equal(totalSettled, totalDebt);
  });

  test("Multiple payers and complex multi-transaction balance conservation", () => {
    const members = [
      { id: "m1", name: "Alice", createdAt: new Date(1000) },
      { id: "m2", name: "Bob", createdAt: new Date(2000) },
      { id: "m3", name: "Charlie", createdAt: new Date(3000) },
      { id: "m4", name: "Dave", createdAt: new Date(4000) },
      { id: "m5", name: "Eve", createdAt: new Date(5000) },
    ];

    const expenses = [
      { id: "e1", paidByMemberId: "m1", amount: BigInt(250000), title: "Villa" },
      { id: "e2", paidByMemberId: "m2", amount: BigInt(150000), title: "BBQ" },
      { id: "e3", paidByMemberId: "m3", amount: BigInt(75000), title: "Snacks" },
      { id: "e4", paidByMemberId: "m1", amount: BigInt(50000), title: "Gas" },
      { id: "e5", paidByMemberId: "m5", amount: BigInt(125000), title: "Drinks" },
    ];

    const result = calculateSplitAndSettlements(members, expenses);
    const total = BigInt(650000);
    assert.equal(result.totalAmount, total);
    assert.equal(result.baseShare, BigInt(130000));
    assert.equal(result.remainder, BigInt(0));

    // Number of settlements must be <= N - 1 (<= 4)
    assert.ok(result.settlements.length <= 4);

    // Each settlement amount must be strictly positive
    for (const s of result.settlements) {
      assert.ok(s.amount > BigInt(0));
      assert.notEqual(s.fromMemberId, s.toMemberId);
    }
  });

  test("Zero expense event preserves integrity", () => {
    const members = [
      { id: "m1", name: "A", createdAt: new Date() },
      { id: "m2", name: "B", createdAt: new Date() },
    ];
    const result = calculateSplitAndSettlements(members, []);
    assert.equal(result.totalAmount, BigInt(0));
    assert.equal(result.settlements.length, 0);
  });

  test("Rupiah parser handling diverse Indonesian input formats", () => {
    assert.equal(parseRupiahInput("Rp 1.500.000"), BigInt(1500000));
    assert.equal(parseRupiahInput("1.500.000"), BigInt(1500000));
    assert.equal(parseRupiahInput("Rp1500000"), BigInt(1500000));
    assert.equal(parseRupiahInput("  250000  "), BigInt(250000));
    assert.equal(parseRupiahInput("0"), BigInt(0));
    assert.equal(parseRupiahInput("-50000"), BigInt(0));
    assert.equal(parseRupiahInput("invalid"), BigInt(0));
  });

  test("Rupiah formatter display accuracy", () => {
    assert.equal(formatRupiah(BigInt(0)), "Rp 0");
    assert.equal(formatRupiah(BigInt(50000)), "Rp 50.000");
    assert.equal(formatRupiah(BigInt(123456789)), "Rp 123.456.789");
    assert.equal(formatRupiahWithSign(BigInt(50000)), "+Rp 50.000");
    assert.equal(formatRupiahWithSign(BigInt(-33500)), "-Rp 33.500");
    assert.equal(formatRupiahWithSign(BigInt(0)), "Rp 0");
  });
});
