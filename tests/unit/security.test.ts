import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateTokenSecret, OFFICIAL_AI_AGENT_TOKEN } from "../../src/lib/api/auth.ts";
import { API_SCOPE_VALUES, USER_ASSIGNABLE_SCOPES, ADMIN_ONLY_SCOPES } from "../../src/lib/scopes.ts";
import { apiTokenSchema } from "../../src/lib/validation.ts";
import { isTrustedOrigin, generateSignedOAuthState, verifySignedOAuthState } from "../../src/lib/oauth-state.ts";

process.env.SESSION_SECRET ??= "unit-test-oauth-signing-secret-32chars-min";

describe("API token scope privilege boundary", () => {
  test("self-assignable scopes never include administrator authority", () => {
    assert.ok(
      !USER_ASSIGNABLE_SCOPES.includes("admin:manage"),
      "a user must not be able to grant themselves admin:manage"
    );
    for (const scope of USER_ASSIGNABLE_SCOPES) {
      assert.ok(
        !ADMIN_ONLY_SCOPES.includes(scope),
        `scope ${scope} is both user-assignable and admin-only`
      );
    }
  });

  test("privileged scopes are classified as admin-only", () => {
    for (const scope of ["admin:manage", "articles:write", "articles:read"] as const) {
      assert.ok(ADMIN_ONLY_SCOPES.includes(scope), `${scope} must be admin-only`);
    }
  });

  test("token schema rejects unknown scopes and accepts known ones", () => {
    assert.strictEqual(
      apiTokenSchema.safeParse({ name: "Agent", scopes: ["read:campaigns"] }).success,
      true
    );
    assert.strictEqual(
      apiTokenSchema.safeParse({ name: "Agent", scopes: ["read:campaigns", "root:everything"] })
        .success,
      false
    );
    assert.strictEqual(apiTokenSchema.safeParse({ name: "Agent", scopes: [] }).success, false);
  });

  test("every advertised scope parses", () => {
    const parsed = apiTokenSchema.safeParse({ name: "Agent", scopes: [...API_SCOPE_VALUES] });
    assert.strictEqual(parsed.success, true);
  });
});

describe("Generated API token shape", () => {
  test("prefix fits the api_tokens.token_prefix column (varchar 64)", () => {
    for (let i = 0; i < 50; i += 1) {
      const { rawToken, tokenHash, tokenPrefix } = generateTokenSecret();
      assert.match(rawToken, /^fs_live_[0-9a-f]{48}$/);
      assert.match(tokenHash, /^[0-9a-f]{64}$/);
      assert.ok(
        tokenPrefix.length <= 64,
        `token prefix length ${tokenPrefix.length} overflows varchar(64)`
      );
    }
  });

  test("no official agent token is baked into the source", () => {
    assert.strictEqual(
      OFFICIAL_AI_AGENT_TOKEN,
      null,
      "OFFICIAL_AI_AGENT_TOKEN must come from FAIRSHARE_AGENT_TOKEN, never a literal"
    );
  });
});

describe("OAuth redirect origin allowlist", () => {
  test("accepts the project's own origins", () => {
    for (const origin of [
      "https://fairshare.copilotmarketing.id",
      "https://www.fairshare.copilotmarketing.id",
      "https://app-fairshare.vercel.app",
      "http://localhost:3000",
    ]) {
      assert.strictEqual(isTrustedOrigin(origin), true, `${origin} should be trusted`);
    }
  });

  test("rejects attacker-controlled and malformed origins", () => {
    for (const origin of [
      "https://evil.tld",
      "https://copilotmarketing.id.evil.tld",
      "https://evilcopilotmarketing.id",
      "javascript:alert(1)",
      "not-a-url",
      "",
    ]) {
      assert.strictEqual(isTrustedOrigin(origin), false, `${origin} must not be trusted`);
    }
  });
});

describe("OAuth signing secret policy", () => {
  const LEAKED = "fairshare_jwt_session_secret_key_super_secure_32_chars_min!";
  const origin = "https://fairshare.copilotmarketing.id";
  const redirectUri = `${origin}/api/auth/google/callback`;

  const withSecrets = (sessionSecret: string | undefined, googleSecret: string | undefined, run: () => void) => {
    const originalSession = process.env.SESSION_SECRET;
    const originalGoogle = process.env.GOOGLE_CLIENT_SECRET;
    try {
      if (sessionSecret === undefined) delete process.env.SESSION_SECRET;
      else process.env.SESSION_SECRET = sessionSecret;
      if (googleSecret === undefined) delete process.env.GOOGLE_CLIENT_SECRET;
      else process.env.GOOGLE_CLIENT_SECRET = googleSecret;
      run();
    } finally {
      if (originalSession === undefined) delete process.env.SESSION_SECRET;
      else process.env.SESSION_SECRET = originalSession;
      if (originalGoogle === undefined) delete process.env.GOOGLE_CLIENT_SECRET;
      else process.env.GOOGLE_CLIENT_SECRET = originalGoogle;
    }
  };

  test("refuses to sign when the only available secret was published in the repo", () => {
    withSecrets(LEAKED, undefined, () => {
      assert.throws(
        () => generateSignedOAuthState(origin, redirectUri),
        /SESSION_SECRET/,
        "a repository-published secret must never be accepted as the signing key"
      );
    });
  });

  test("falls back to a non-leaked secret when one is available", () => {
    withSecrets(LEAKED, "a-genuinely-random-fallback-secret-value-32", () => {
      const state = generateSignedOAuthState(origin, redirectUri);
      assert.strictEqual(verifySignedOAuthState(state, undefined).valid, true);
    });
  });
});
