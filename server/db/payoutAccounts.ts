import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { payoutAccounts, InsertPayoutAccount, PayoutAccount } from "../../drizzle/schema";
import {
  encryptBankAccount,
  decryptBankAccount,
  encryptRoutingNumber,
  decryptRoutingNumber,
  getLast4Digits,
} from "../security/dbEncryption";

/**
 * Payout Account Database Helpers
 * 
 * Automatically encrypts/decrypts sensitive fields:
 * - Bank account numbers
 * - Routing numbers
 * 
 * Usage:
 * ```ts
 * // Create payout account (auto-encrypts)
 * await createPayoutAccount(artistId, {
 *   accountHolderName: "John Doe",
 *   routingNumber: "021000021",
 *   accountNumber: "1234567890",
 *   ...
 * });
 * 
 * // Get payout account (auto-decrypts)
 * const account = await getPayoutAccountById(accountId);
 * console.log(account.accountNumber); // "1234567890" (decrypted)
 * ```
 */

/**
 * Decrypted payout account (for application use)
 */
export interface DecryptedPayoutAccount extends Omit<PayoutAccount, 'routingNumber' | 'accountNumberHash'> {
  routingNumber: string; // Decrypted
  accountNumber: string; // Decrypted (full number)
}

/**
 * Create payout account
 * 
 * Automatically encrypts sensitive fields before storing
 * 
 * @param artistId - Artist ID
 * @param data - Payout account data (with plaintext account/routing numbers)
 * @returns Created payout account ID
 */
export async function createPayoutAccount(
  artistId: number,
  data: {
    accountHolderName: string;
    accountType: 'checking' | 'savings';
    routingNumber: string; // Plaintext
    accountNumber: string; // Plaintext
    bankName?: string;
    isDefault?: boolean;
  }
): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Encrypt sensitive fields
  const encryptedRoutingNumber = encryptRoutingNumber(data.routingNumber);
  const encryptedAccountNumber = encryptBankAccount(data.accountNumber);
  const last4 = getLast4Digits(data.accountNumber);

  // Insert into database
  const result = await db.insert(payoutAccounts).values({
    artistId,
    accountHolderName: data.accountHolderName,
    accountType: data.accountType,
    routingNumber: encryptedRoutingNumber,
    accountNumberLast4: last4,
    accountNumberHash: encryptedAccountNumber, // Store encrypted account number in hash field
    bankName: data.bankName,
    isDefault: data.isDefault ?? false,
    verificationStatus: 'pending',
  });

  // Get the inserted ID from the result
  const insertedId = Number(result[0].insertId);
  return insertedId;
}

/**
 * Get payout account by ID
 * 
 * Automatically decrypts sensitive fields
 * 
 * @param accountId - Payout account ID
 * @returns Decrypted payout account
 */
export async function getPayoutAccountById(
  accountId: number
): Promise<DecryptedPayoutAccount | null> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db
    .select()
    .from(payoutAccounts)
    .where(eq(payoutAccounts.id, accountId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const account = result[0];

  // Decrypt sensitive fields
  return {
    ...account,
    routingNumber: decryptRoutingNumber(account.routingNumber),
    accountNumber: decryptBankAccount(account.accountNumberHash),
  };
}

/**
 * Get all payout accounts for artist
 * 
 * Automatically decrypts sensitive fields
 * 
 * @param artistId - Artist ID
 * @returns List of decrypted payout accounts
 */
export async function getPayoutAccountsByArtist(
  artistId: number
): Promise<DecryptedPayoutAccount[]> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const results = await db
    .select()
    .from(payoutAccounts)
    .where(eq(payoutAccounts.artistId, artistId));

  // Decrypt all accounts
  return results.map(account => ({
    ...account,
    routingNumber: decryptRoutingNumber(account.routingNumber),
    accountNumber: decryptBankAccount(account.accountNumberHash),
  }));
}

/**
 * Get default payout account for artist
 * 
 * @param artistId - Artist ID
 * @returns Default payout account (decrypted)
 */
export async function getDefaultPayoutAccount(
  artistId: number
): Promise<DecryptedPayoutAccount | null> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const results = await db
    .select()
    .from(payoutAccounts)
    .where(eq(payoutAccounts.artistId, artistId));

  // Filter for default account
  const result = results.filter(account => account.isDefault);

  if (result.length === 0) {
    return null;
  }

  const account = result[0];

  return {
    ...account,
    routingNumber: decryptRoutingNumber(account.routingNumber),
    accountNumber: decryptBankAccount(account.accountNumberHash),
  };
}

/**
 * Update payout account
 * 
 * Automatically encrypts sensitive fields if provided
 * 
 * @param accountId - Payout account ID
 * @param data - Fields to update
 */
export async function updatePayoutAccount(
  accountId: number,
  data: Partial<{
    accountHolderName: string;
    accountType: 'checking' | 'savings';
    routingNumber: string; // Plaintext
    accountNumber: string; // Plaintext
    bankName: string;
    isDefault: boolean;
    verificationStatus: 'pending' | 'verified' | 'failed';
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const updateData: any = {};

  // Copy non-sensitive fields
  if (data.accountHolderName !== undefined) {
    updateData.accountHolderName = data.accountHolderName;
  }
  if (data.accountType !== undefined) {
    updateData.accountType = data.accountType;
  }
  if (data.bankName !== undefined) {
    updateData.bankName = data.bankName;
  }
  if (data.isDefault !== undefined) {
    updateData.isDefault = data.isDefault;
  }
  if (data.verificationStatus !== undefined) {
    updateData.verificationStatus = data.verificationStatus;
  }

  // Encrypt sensitive fields
  if (data.routingNumber !== undefined) {
    updateData.routingNumber = encryptRoutingNumber(data.routingNumber);
  }
  if (data.accountNumber !== undefined) {
    updateData.accountNumberHash = encryptBankAccount(data.accountNumber);
    updateData.accountNumberLast4 = getLast4Digits(data.accountNumber);
  }

  await db
    .update(payoutAccounts)
    .set(updateData)
    .where(eq(payoutAccounts.id, accountId));
}

/**
 * Delete payout account
 * 
 * @param accountId - Payout account ID
 */
export async function deletePayoutAccount(accountId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db
    .delete(payoutAccounts)
    .where(eq(payoutAccounts.id, accountId));
}

/**
 * Verify payout account
 * 
 * Marks account as verified (after micro-deposit verification or similar)
 * 
 * @param accountId - Payout account ID
 */
export async function verifyPayoutAccount(accountId: number): Promise<void> {
  await updatePayoutAccount(accountId, {
    verificationStatus: 'verified',
  });
}
