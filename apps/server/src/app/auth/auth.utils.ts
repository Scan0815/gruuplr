import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 12; // 🔥 Anzahl der Salt-Runden (sicher & performant)

/**
 * ✅ Passwort sicher mit `bcrypt` hashen
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * ✅ Passwort sicher validieren
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  console.log('password', password  ,storedHash);
  return await bcrypt.compare(password, storedHash);
}