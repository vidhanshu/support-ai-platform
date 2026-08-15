import { createHash, randomBytes } from "node:crypto";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKeySecret(isProd: boolean): {
  rawKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  const envPrefix = isProd ? "sak_live_" : "sak_test_";
  const secret = randomBytes(24).toString("base64url");
  const rawKey = `${envPrefix}${secret}`;
  return {
    rawKey,
    keyPrefix: rawKey.slice(0, 12),
    keyHash: hashApiKey(rawKey),
  };
}

export function extractBearerOrApiKey(
  authorization?: string,
  xApiKey?: string,
): string | null {
  if (xApiKey?.trim()) return xApiKey.trim();
  if (!authorization) return null;
  const [scheme, token] = authorization.split(/\s+/);
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}
