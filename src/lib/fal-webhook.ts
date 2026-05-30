import {
  createHash,
  createPublicKey,
  verify,
  type JsonWebKey,
  type KeyObject,
} from "node:crypto";

// Verifies fal.ai webhook signatures (ED25519). The JWK `x` is the raw public
// key, so Node's crypto can verify directly — no libsodium dependency needed.
// https://fal.ai/docs/documentation/model-apis/inference/webhooks

const JWKS_URL = "https://rest.fal.ai/.well-known/jwks.json";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_SKEW_SECONDS = 300;

let cache: { keys: KeyObject[]; expires: number } | null = null;

async function getKeys(): Promise<KeyObject[]> {
  if (cache && cache.expires > Date.now()) return cache.keys;

  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const { keys } = (await res.json()) as { keys: JsonWebKey[] };

  const parsed = keys
    .filter((key) => key.kty === "OKP" && key.crv === "Ed25519")
    .map((key) => createPublicKey({ key, format: "jwk" }));
  cache = { keys: parsed, expires: Date.now() + CACHE_TTL };
  return parsed;
}

export async function verifyFalWebhook(
  rawBody: string,
  headers: Headers,
): Promise<boolean> {
  const requestId = headers.get("x-fal-webhook-request-id");
  const userId = headers.get("x-fal-webhook-user-id");
  const timestamp = headers.get("x-fal-webhook-timestamp");
  const signature = headers.get("x-fal-webhook-signature");
  if (!requestId || !userId || !timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > MAX_SKEW_SECONDS) {
    return false;
  }

  const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  const message = Buffer.from(
    [requestId, userId, timestamp, bodyHash].join("\n"),
    "utf8",
  );
  const sig = Buffer.from(signature, "hex");

  try {
    const keys = await getKeys();
    return keys.some((key) => verify(null, message, key, sig));
  } catch {
    return false;
  }
}
