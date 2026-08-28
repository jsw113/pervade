import crypto from "crypto";

/**
 * Standard PBKDF2 Secure Password Hashing
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash or secure env fallback
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  // If stored in PBKDF2 salt:hash format
  if (storedHash.includes(":")) {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    try {
      const keyBuffer = Buffer.from(key, "hex");
      const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512");
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch (e) {
      return false;
    }
  }

  // Legacy fallback match
  return password === storedHash;
}
