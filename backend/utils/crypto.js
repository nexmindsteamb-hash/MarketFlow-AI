const crypto = require("crypto");

/**
 * AES-256-GCM helpers for social media access tokens.
 * Key: TOKEN_ENCRYPTION_KEY = 64 hex characters (32 bytes).
 * Generate one with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * Stored format: iv:authTag:ciphertext (all hex).
 */
function getKey() {
  const hex = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes).");
  }
  return Buffer.from(hex, "hex");
}

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  return [iv.toString("hex"), cipher.getAuthTag().toString("hex"), enc.toString("hex")].join(":");
}

function decrypt(stored) {
  const [ivHex, tagHex, dataHex] = String(stored).split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted value.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

module.exports = { encrypt, decrypt, sha256 };
