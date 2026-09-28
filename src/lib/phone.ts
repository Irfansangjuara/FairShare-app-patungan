/**
 * Normalizes phone numbers into a clean digit string with Indonesian standard format (08xxx).
 */
export function normalizePhoneNumber(raw: string): string {
  const cleaned = raw.trim().replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+62")) {
    return "0" + cleaned.slice(3);
  }
  if (cleaned.startsWith("62")) {
    return "0" + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Returns possible database search variants for a given phone input
 * to support flexible user input (08xxx, +62xxx, 62xxx).
 */
export function getPhoneVariants(raw: string): string[] {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  const variants = new Set<string>();

  if (trimmed) {
    variants.add(trimmed);
  }

  if (digits) {
    variants.add(digits);
    if (digits.startsWith("0")) {
      const withoutZero = digits.slice(1);
      variants.add("62" + withoutZero);
      variants.add("+62" + withoutZero);
      variants.add("0" + withoutZero);
    } else if (digits.startsWith("62")) {
      const without62 = digits.slice(2);
      variants.add("0" + without62);
      variants.add("+62" + without62);
      variants.add("62" + without62);
    }
  }

  return Array.from(variants);
}
