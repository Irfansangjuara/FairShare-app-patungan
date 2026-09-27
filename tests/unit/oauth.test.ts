import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateSignedOAuthState,
  verifySignedOAuthState,
} from "../../src/lib/oauth-state.ts";

describe("Google OAuth Security & Resilient State Verification", () => {
  test("generates and verifies valid signed OAuth state successfully without cookie", () => {
    const origin = "https://fairshare.copilotmarketing.id";
    const redirectUri = "https://fairshare.copilotmarketing.id/api/auth/google/callback";
    const redirectPath = "/dashboard";

    const stateToken = generateSignedOAuthState(origin, redirectUri, redirectPath);
    assert.ok(stateToken.includes("."), "State token should contain payload and signature");

    // Test verification when cookies are lost (e.g. cross-domain redirect or Safari ITP)
    const verification = verifySignedOAuthState(stateToken, undefined);
    assert.strictEqual(verification.valid, true);
    assert.strictEqual(verification.payload?.origin, origin);
    assert.strictEqual(verification.payload?.redirectUri, redirectUri);
    assert.strictEqual(verification.payload?.redirectPath, redirectPath);
  });

  test("rejects tampered state tokens", () => {
    const origin = "https://fairshare.copilotmarketing.id";
    const redirectUri = "https://fairshare.copilotmarketing.id/api/auth/google/callback";
    const stateToken = generateSignedOAuthState(origin, redirectUri);

    const [payload, sig] = stateToken.split(".");
    // Tamper with payload
    const tamperedPayload = payload.slice(0, -4) + "AAAA";
    const tamperedToken = `${tamperedPayload}.${sig}`;

    const verification = verifySignedOAuthState(tamperedToken, undefined);
    assert.strictEqual(verification.valid, false);
  });

  test("rejects null or empty state parameter", () => {
    assert.strictEqual(verifySignedOAuthState(null, undefined).valid, false);
    assert.strictEqual(verifySignedOAuthState("", undefined).valid, false);
  });

  test("allows fallback if cookie state matches exactly", () => {
    const rawState = "random_simple_state_string_12345";
    const verification = verifySignedOAuthState(rawState, rawState);
    assert.strictEqual(verification.valid, true);
  });
});
