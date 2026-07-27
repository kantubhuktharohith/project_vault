import { createServerFn } from "@tanstack/react-start";
import {
  getAdminPassword,
  createToken,
  isAdminRequest,
  COOKIE_NAME,
  MAX_AGE_MS,
} from "@/lib/auth.server";

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
    return {
      success: true as const,
      token,
      cookieName: COOKIE_NAME,
      maxAgeSeconds: MAX_AGE_MS / 1000,
    };
  });

/** Check if the current session is admin */
export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { isAdmin: isAdminRequest() };
});
