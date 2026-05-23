import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// Ensure a safe fallback for the secret
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "neuroquest-default-fallback-jwt-secret-key-32-chars"
);

/**
 * Generates a signed JWT for a user session.
 */
export async function generateJWT(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // 30-day session lifespan
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT and returns the parsed payload, or null if invalid.
 */
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}

/**
 * Generates a cryptographically random-ish 6-digit numeric OTP code.
 */
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hashes a plain-text password using bcryptjs.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

/**
 * Compares a plain-text password with a hashed password using bcryptjs.
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
