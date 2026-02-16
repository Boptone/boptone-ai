# Encryption Key Management

This document describes how encryption keys are managed for the Boptone platform to protect sensitive artist data.

---

## Overview

Boptone uses **AES-256-CBC encryption** to protect sensitive data at rest in the database:
- Bank account numbers
- Routing numbers
- Social Security Numbers (SSNs)
- Tax IDs (EINs)

All encryption/decryption happens automatically through database helper functions. Developers never need to handle encryption keys directly.

---

## Encryption Key

### Environment Variable

The encryption key is stored in the `ENCRYPTION_KEY` environment variable.

**Format:** 64 hexadecimal characters (32 bytes)

**Example:**
```bash
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Generating a New Key

To generate a new encryption key, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a secure random 64-character hex string.

---

## Key Storage

### Development

In development, the encryption key is stored in `.env` (never committed to git).

### Production

In production, the encryption key is stored in:
- **Manus Platform:** Automatically injected as a secret environment variable
- **External Hosting:** Store in your hosting provider's secrets manager (AWS Secrets Manager, Heroku Config Vars, etc.)

**⚠️ NEVER commit encryption keys to git or expose them in logs.**

---

## Key Rotation

### When to Rotate

Rotate encryption keys:
- **Annually** (recommended best practice)
- **Immediately** if key is compromised
- **Before SOC 2 audit** (demonstrate key rotation capability)

### How to Rotate

1. **Generate new key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add new key to environment:**
   ```bash
   ENCRYPTION_KEY_NEW=<new_key_here>
   ```

3. **Run migration script:**
   ```bash
   pnpm run migrate:rotate-keys
   ```
   
   This script will:
   - Decrypt all sensitive data with old key
   - Re-encrypt with new key
   - Update database records

4. **Swap keys:**
   ```bash
   ENCRYPTION_KEY=<new_key_here>
   ```

5. **Remove old key:**
   ```bash
   unset ENCRYPTION_KEY_NEW
   ```

### Migration Script

Create `server/scripts/rotateEncryptionKeys.ts`:

```typescript
import { getDb } from '../db';
import { payoutAccounts } from '../../drizzle/schema';
import { decryptData, encryptData } from '../security/encryption';

async function rotateKeys() {
  const oldKey = process.env.ENCRYPTION_KEY;
  const newKey = process.env.ENCRYPTION_KEY_NEW;
  
  if (!oldKey || !newKey) {
    throw new Error('Both ENCRYPTION_KEY and ENCRYPTION_KEY_NEW must be set');
  }
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  
  // Get all payout accounts
  const accounts = await db.select().from(payoutAccounts);
  
  console.log(`Rotating keys for ${accounts.length} payout accounts...`);
  
  for (const account of accounts) {
    // Decrypt with old key
    const oldRoutingNumber = decryptData(account.routingNumber, oldKey);
    const oldAccountNumber = decryptData(account.accountNumberHash, oldKey);
    
    // Re-encrypt with new key
    const newRoutingNumber = encryptData(oldRoutingNumber, newKey);
    const newAccountNumber = encryptData(oldAccountNumber, newKey);
    
    // Update database
    await db
      .update(payoutAccounts)
      .set({
        routingNumber: newRoutingNumber,
        accountNumberHash: newAccountNumber,
      })
      .where(eq(payoutAccounts.id, account.id));
  }
  
  console.log('✅ Key rotation complete');
}

rotateKeys().catch(console.error);
```

---

## Security Best Practices

### Key Access Control

- **Limit access:** Only senior engineers and DevOps should have access to encryption keys
- **Audit access:** Log all access to encryption keys
- **Separate environments:** Use different keys for dev, staging, and production

### Key Backup

- **Backup keys securely:** Store encrypted backups in a password manager (1Password, LastPass)
- **Multiple custodians:** At least 2 people should have access to production keys
- **Recovery plan:** Document key recovery process in case of emergency

### Monitoring

- **Alert on decryption failures:** Monitor for failed decryption attempts (may indicate key mismatch)
- **Track key age:** Set up alerts when keys are > 365 days old
- **Audit encryption usage:** Log all encryption/decryption operations for compliance

---

## Compliance

### SOC 2 Requirements

For SOC 2 compliance, you must:
- ✅ Encrypt sensitive data at rest (bank accounts, SSNs, tax IDs)
- ✅ Store encryption keys separately from encrypted data
- ✅ Rotate encryption keys annually
- ✅ Log all key access and rotation events
- ✅ Implement key recovery process
- ✅ Document key management procedures (this document)

### PCI DSS Requirements

For PCI DSS compliance (credit card data), you must:
- ✅ Use strong cryptography (AES-256)
- ✅ Protect encryption keys from unauthorized access
- ✅ Rotate keys annually
- ✅ Implement key version tracking
- ✅ Log all cryptographic operations

---

## Troubleshooting

### "Decryption failed" errors

**Cause:** Wrong encryption key or corrupted data

**Fix:**
1. Verify `ENCRYPTION_KEY` matches the key used to encrypt the data
2. Check if key was recently rotated
3. Restore from backup if data is corrupted

### "ENCRYPTION_KEY not set" errors

**Cause:** Environment variable not configured

**Fix:**
1. Add `ENCRYPTION_KEY` to `.env` (development)
2. Add to secrets manager (production)
3. Restart server

### Key rotation failed

**Cause:** Database connection lost during rotation

**Fix:**
1. Restore database from backup
2. Re-run rotation script with longer timeout
3. Consider rotating in batches (1000 records at a time)

---

## Emergency Key Recovery

If encryption keys are lost:

1. **Check backups:** Look in password manager, secrets manager, or backup `.env` files
2. **Contact team:** Ask other engineers if they have a copy
3. **Restore from database backup:** If you have a recent backup, restore it and extract the key from the backup's environment
4. **Last resort:** If keys are permanently lost, encrypted data cannot be recovered. You'll need to:
   - Contact affected artists
   - Request new bank account information
   - Re-encrypt with new keys

**⚠️ This is why key backups are critical.**

---

## Contact

For questions about encryption key management, contact:
- **Security Lead:** [Your Email]
- **DevOps Lead:** [DevOps Email]
- **Emergency:** [Emergency Contact]
