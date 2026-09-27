import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateSignedOAuthState,
  verifySignedOAuthState,
  resolveOAuthRedirectUri,
  createSessionSyncToken,
  verifySessionSyncToken,
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

describe("Google OAuth Multi-Domain Resolution & Synchronization", () => {
  test("resolves correct callback URI for fairshare.copilotmarketing.id", () => {
    const uri = resolveOAuthRedirectUri("fairshare.copilotmarketing.id");
    assert.strictEqual(uri, "https://fairshare.copilotmarketing.id/api/auth/google/callback");
  });

  test("resolves correct callback URI for www.fairshare.copilotmarketing.id", () => {
    const uri = resolveOAuthRedirectUri("www.fairshare.copilotmarketing.id");
    assert.strictEqual(uri, "https://www.fairshare.copilotmarketing.id/api/auth/google/callback");
  });

  test("resolves correct callback URI for app-fairshare.vercel.app", () => {
    const uri = resolveOAuthRedirectUri("app-fairshare.vercel.app");
    assert.strictEqual(uri, "https://app-fairshare.vercel.app/api/auth/google/callback");
  });

  test("resolves correct callback URI for www.app-fairshare.vercel.app", () => {
    const uri = resolveOAuthRedirectUri("www.app-fairshare.vercel.app");
    assert.strictEqual(uri, "https://www.app-fairshare.vercel.app/api/auth/google/callback");
  });

  test("resolves correct callback URI for localhost:3000", () => {
    const uri = resolveOAuthRedirectUri("localhost:3000");
    assert.strictEqual(uri, "http://localhost:3000/api/auth/google/callback");
  });

  test("creates and verifies cross-domain session sync token", () => {
    const fakeSessionId = "session_xyz_1234567890abcdef";
    const token = createSessionSyncToken(fakeSessionId);
    assert.ok(token.includes("."), "Sync token should contain payload and signature");

    const result = verifySessionSyncToken(token);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sessionId, fakeSessionId);
  });

  test("rejects tampered cross-domain sync token", () => {
    const fakeSessionId = "session_xyz_1234567890abcdef";
    const token = createSessionSyncToken(fakeSessionId);
    const [payload, sig] = token.split(".");
    const tampered = `${payload.slice(0, -2)}AA.${sig}`;

    const result = verifySessionSyncToken(tampered);
    assert.strictEqual(result.valid, false);
  });

  test("rejects null or empty sync token", () => {
    assert.strictEqual(verifySessionSyncToken(null).valid, false);
    assert.strictEqual(verifySessionSyncToken("").valid, false);
  });
});
