/**
 * Edge-compatible JWT verification helper.
 * This file ONLY uses jose (Web Crypto API compatible) — no bcryptjs or Node.js-only APIs.
 * It is safe to import from middleware.ts which runs in the Edge Runtime.
 */
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "neuroquest-default-fallback-jwt-secret-key-32-chars"
);

export async function verifyJWTEdge(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}
