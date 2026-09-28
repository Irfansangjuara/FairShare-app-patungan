import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/**
 * Session probe for client components.
 *
 * Public marketing pages must stay statically renderable, so they cannot call
 * `getSessionUser()` (which reads cookies and would force dynamic rendering).
 * The navbar hydrates its signed-in state from this endpoint instead.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();

  return NextResponse.json(
    {
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
