/**
 * Canonical API scope vocabulary, shared by the validation layer and the
 * token verifier. Kept dependency-free so importing it never pulls in the
 * database client.
 */
export const API_SCOPE_VALUES = [
  "read:campaigns",
  "write:expenses",
  "read:settlements",
  "write:settlements",
  "articles:read",
  "articles:write",
  "admin:manage",
] as const;

export type ApiScope = (typeof API_SCOPE_VALUES)[number];

/**
 * Scopes a regular (non-admin) user may grant to their own API token.
 * `admin:manage` and the article scopes are deliberately absent: a
 * self-issued token must never become a path to administrator authority.
 */
export const USER_ASSIGNABLE_SCOPES: readonly ApiScope[] = [
  "read:campaigns",
  "write:expenses",
  "read:settlements",
  "write:settlements",
];

export const ADMIN_ONLY_SCOPES: readonly ApiScope[] = [
  "articles:read",
  "articles:write",
  "admin:manage",
];
