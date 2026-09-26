/**
 * Formatter and parser for Indonesian Rupiah (IDR) using integer BigInt
 */

const ZERO = BigInt(0);

export function formatRupiah(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? amount : BigInt(Math.round(amount));
  const isNegative = value < ZERO;
  const absValue = isNegative ? -value : value;
  
  // Format with thousand separator '.'
  const formatted = absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  if (isNegative) {
    return `-Rp ${formatted}`;
  }
  return `Rp ${formatted}`;
}

export function formatRupiahWithSign(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? amount : BigInt(Math.round(amount));
  if (value > ZERO) {
    return `+${formatRupiah(value)}`;
  }
  return formatRupiah(value);
}

export function parseRupiahInput(input: string): bigint {
  const cleaned = input.replace(/[^0-9]/g, "");
  if (!cleaned) return ZERO;
  return BigInt(cleaned);
}
