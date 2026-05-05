import { createDecipheriv, createHmac } from "node:crypto";
import { MalformedTokenError } from "./errors";
import type { User } from "./entities";
import { getUserById } from "./repository/repository.ts";

const key = (process.env.FIREFLY_KEY ?? "")

export const AuthTokenName = "laravel_token";

export interface AuthToken {
  iv: string;
  value: string;
  mac: string;
  tag: string;
}

export async function authenticateUser(token: string): Promise<User | undefined> {

  const session: AuthToken = JSON.parse(atob(token));

  // Validate session structure
  if (!session.iv || !session.value || !session.mac) {
    throw new MalformedTokenError('Invalid session token: missing required fields');
  }

  // Process encryption key (handle Laravel's base64: prefix if present)
  const rawKey = key; // key is from line 6, process.env.FIREFLY_KEY
  let keyBuffer: Buffer;
  if (rawKey.startsWith('base64:')) {
    keyBuffer = Buffer.from(rawKey.slice(7), 'base64');
  } else {
    keyBuffer = Buffer.from(rawKey);
  }

  // Verify session MAC to ensure integrity
  const computedMac = createHmac('sha256', keyBuffer)
    .update(session.iv + session.value)
    .digest('hex');

  if (computedMac !== session.mac) {
    throw new MalformedTokenError('Invalid session token: MAC mismatch');
  }

  // Decrypt the session value using AES-256-CBC
  const iv = Buffer.from(session.iv, 'base64');
  const ciphertext = Buffer.from(session.value, 'base64');
  const decipher = createDecipheriv('aes-256-cbc', keyBuffer, iv);
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  const decryptedSessionData = decrypted.toString('utf-8');

  const jwt = decryptedSessionData.split("|")[1];

  if (!jwt) {
    throw new MalformedTokenError('Invalid session token: missing JWT');
  }



  const payload = jwt.split(".")[1];

  if (!payload) {
    throw new MalformedTokenError('Invalid session token: missing JWT payload');
  }

  const parsedPayload = JSON.parse(atob(payload))

  const user = await getUserById(parsedPayload.sub)

  return user;
}
