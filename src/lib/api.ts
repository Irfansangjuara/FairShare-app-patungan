/**
 * apiFetch — satu pintu untuk semua API call dari sisi klien.
 *
 * NEXT_PUBLIC_API_URL diset ke string kosong saat backend sudah di-merge ke
 * dalam Next.js (monorepo). Panggilan otomatis menjadi relative path, misalnya
 * /api/v1/campaigns, sehingga hanya satu dev server yang perlu berjalan.
 *
 * Untuk development dengan Express terpisah, set env var ke:
 *   NEXT_PUBLIC_API_URL=http://localhost:4000
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // JSON parse gagal — pakai pesan default
    }
    throw new Error(message);
  }

  // 204 No Content tidak punya body
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
