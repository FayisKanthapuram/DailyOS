/**
 * In-Memory Token Store
 * Keeps Access Tokens in JavaScript memory ONLY.
 * Never stores tokens in localStorage or sessionStorage (protecting against XSS attacks).
 */

let accessTokenInMemory: string | null = null;

export const tokenStore = {
  getAccessToken(): string | null {
    return accessTokenInMemory;
  },
  setAccessToken(token: string | null): void {
    accessTokenInMemory = token;
  },
  clearAccessToken(): void {
    accessTokenInMemory = null;
  },
};
