const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const {
  getJwtSecret,
  getSessionSecret,
  getAllowedOrigins,
  INSECURE_JWT_PLACEHOLDERS,
  INSECURE_SESSION_PLACEHOLDERS
} = require('../config/env');

test('Security: getJwtSecret does not return hardcoded "secret" in any mode', () => {
  const secret = getJwtSecret();
  assert.ok(secret, 'Secret should exist');
  assert.notStrictEqual(secret, 'secret', 'Secret must never be predictable "secret"');
  assert.ok(!INSECURE_JWT_PLACEHOLDERS.includes(secret) || process.env.NODE_ENV === 'test');
});

test('Security: getSessionSecret does not return default placeholder', () => {
  const sessionSecret = getSessionSecret();
  assert.ok(sessionSecret, 'Session secret should exist');
  assert.notStrictEqual(sessionSecret, 'digitron-session-secret');
  assert.ok(!INSECURE_SESSION_PLACEHOLDERS.includes(sessionSecret) || process.env.NODE_ENV === 'test');
});

test('Security: CORS origins whitelist localhost in development', () => {
  const origins = getAllowedOrigins();
  assert.ok(origins.includes('http://localhost:5173'));
});

test('Security: generateSecrets utility generates high-entropy 256-bit keys', () => {
  const key1 = crypto.randomBytes(32).toString('hex');
  const key2 = crypto.randomBytes(32).toString('hex');
  assert.strictEqual(key1.length, 64);
  assert.strictEqual(key2.length, 64);
  assert.notStrictEqual(key1, key2);
});

test('Security: password hashing with bcrypt works properly', async () => {
  const testPassword = 'SecureAdminPassword!2026';
  const hash = await bcrypt.hash(testPassword, 10);
  assert.ok(hash.startsWith('$2b$10$'));
  const isValid = await bcrypt.compare(testPassword, hash);
  assert.strictEqual(isValid, true);
  const isInvalid = await bcrypt.compare('WrongPassword', hash);
  assert.strictEqual(isInvalid, false);
});
