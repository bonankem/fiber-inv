import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { appEnv } from "#/env";
import { bad } from "#/utils";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

let savedKey: Buffer;

function encryptionKey() {
  if (savedKey) return savedKey;
  const value = appEnv.CRYPTO_KEY || bad("Auth encryption disabled");
  const key = scryptSync(value, "key.salt", 32);
  savedKey = key;
  return key;
}

export function encrypt(s: string) {
  const key = encryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = cipher.update(s, "utf-8", "hex") + cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

export function decrypt(s: string) {
  const [ivHex, tagHex, cryptHex] = s.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const key = encryptionKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv).setAuthTag(tag);
  return decipher.update(cryptHex, "hex", "utf-8") + decipher.final();
}
