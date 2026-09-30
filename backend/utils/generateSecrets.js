#!/usr/bin/env node
/**
 * Secret & Bcrypt Generator Utility for Digitron Associates
 * Run with: node backend/utils/generateSecrets.js [optional_admin_password]
 */
const crypto = require('crypto');
const bcrypt = require('bcrypt');

async function main() {
  const customPassword = process.argv[2];
  const generatedPassword = customPassword || crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, 'x').slice(0, 14) + '!9';
  
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(generatedPassword, saltRounds);
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  const sessionSecret = crypto.randomBytes(32).toString('hex');

  console.log('\n======================================================');
  console.log('🔐 DIGITRON ASSOCIATES — CREDENTIAL & SECRET GENERATOR');
  console.log('======================================================\n');
  
  console.log('Copy and paste the following lines into your backend/.env (or Vercel Environment Variables):\n');
  console.log('# --- Generated Cryptographic Secrets ---');
  console.log(`JWT_SECRET="${jwtSecret}"`);
  console.log(`SESSION_SECRET="${sessionSecret}"`);
  console.log('ADMIN_USERNAME="admin"');
  console.log(`ADMIN_PASSWORD_HASH="${passwordHash}"\n`);

  if (!customPassword) {
    console.log('------------------------------------------------------');
    console.log(`🔑 Generated Plaintext Admin Password: ${generatedPassword}`);
    console.log('⚠️  Save this password securely in a password manager! You will use it to log in at /admin.');
    console.log('------------------------------------------------------\n');
  } else {
    console.log('------------------------------------------------------');
    console.log(`🔑 Admin Password Hash generated for your custom password.`);
    console.log('------------------------------------------------------\n');
  }
}

main().catch((err) => {
  console.error('Error generating secrets:', err);
  process.exit(1);
});
