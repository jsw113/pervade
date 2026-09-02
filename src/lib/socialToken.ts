import crypto from "crypto";

export interface SocialPendingProfile {
  name: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  socialProvider: "KAKAO" | "NAVER" | "GOOGLE" | "TOSS" | "PASS";
  socialId: string;
  realNameVerified: boolean;
  expiresAt: number;
}

const SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "pervade_secure_social_secret_key_2026_salt";

export function signSocialToken(profile: SocialPendingProfile): string {
  const jsonStr = JSON.stringify(profile);
  const base64 = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(base64).digest("base64url");
  return `${base64}.${signature}`;
}

export function verifySocialToken(token: string): SocialPendingProfile | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(base64).digest("base64url");
    if (signature !== expectedSignature) return null;
    const jsonStr = Buffer.from(base64, "base64url").toString("utf-8");
    const parsed = JSON.parse(jsonStr) as SocialPendingProfile;
    if (!parsed.expiresAt || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}
