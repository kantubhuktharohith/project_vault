import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import crypto from "node:crypto";

const COOKIE_NAME = "vault_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD environment variable is not set");
  return pw;
}

/** Create an HMAC-signed session token */
function createToken(): string {
  const payload = `admin:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", getAdminPassword());
  hmac.update(payload);
  return `${payload}.${hmac.digest("hex")}`;
}

/** Verify an HMAC-signed session token */
function verifyToken(token: string): boolean {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return false;

    const payload = token.substring(0, lastDot);
    const signature = token.substring(lastDot + 1);

    // Must start with "admin:"
    if (!payload.startsWith("admin:")) return false;

    // Check token age
    const timestamp = parseInt(payload.split(":")[1], 10);
    if (isNaN(timestamp)) return false;
    if (Date.now() - timestamp > MAX_AGE_MS) return false;

    // Verify HMAC signature
    const hmac = crypto.createHmac("sha256", getAdminPassword());
    hmac.update(payload);
    const expected = hmac.digest("hex");

    if (signature.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

/** Parse a specific cookie value from a cookie header string */
function parseCookieValue(cookieHeader: string, name: string): string | undefined {
  const regex = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`);
  const match = cookieHeader.match(regex);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

/** Check if the current request has a valid admin session */
export function isAdminRequest(): boolean {
  try {
    const cookieHeader = getRequestHeader("cookie") || "";
    const token = parseCookieValue(cookieHeader, COOKIE_NAME);
    if (!token) return false;
    return verifyToken(token);
  } catch {
    return false;
  }
}

/** Throw if the current request is not from an admin */
export function requireAdmin(): void {
  if (!isAdminRequest()) {
    throw new Error("Forbidden: admin access required");
  }
}

/** Validate password and return a signed session token */
export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid login data");
    const d = data as Record<string, unknown>;
    const password = typeof d.password === "string" ? d.password : "";
    if (!password) throw new Error("Password is required");
    return { password };
  })
  .handler(async ({ data }) => {
    if (data.password !== getAdminPassword()) {
      throw new Error("Invalid password");
    }
    const token = createToken();
    return { success: true as const, token, cookieName: COOKIE_NAME, maxAgeSeconds: MAX_AGE_MS / 1000 };
  });

/** Check if the current session is admin (reads cookie from request) */
export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { isAdmin: isAdminRequest() };
});
