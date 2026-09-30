const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables with fallback hierarchy:
// 1. backend/.env (local backend override)
// 2. root .env (workspace-level configuration)
const backendEnvPath = path.resolve(__dirname, '..', '.env');
const rootEnvPath = path.resolve(__dirname, '..', '..', '.env');

dotenv.config({ path: backendEnvPath });
dotenv.config({ path: rootEnvPath });

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const IS_TEST = NODE_ENV === 'test';
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Known insecure placeholder secrets from templates or defaults
const INSECURE_JWT_PLACEHOLDERS = [
  'secret',
  'super-secure-jwt-secret-digitron-change-in-production',
  'digitron-jwt-secret',
  'change-me',
  'your-jwt-secret',
  'replace-with-secure-random-secret'
];

const INSECURE_SESSION_PLACEHOLDERS = [
  'digitron-session-secret',
  'digitron-session-secret-change-in-production',
  'keyboard cat',
  'secret',
  'replace-with-long-random-string-min-32-chars'
];

const DEFAULT_ADMIN_PASSWORD_HASH = '$2b$10$4KlELkMWhewJQMEfgQs9v.OBg0whTcTM9cXpb1LOjHjd/UZOKwK7K'; // admin123

// Generate random fallback secrets per process execution if none configured in development
// This prevents token forgery by external attackers using known static defaults like 'secret'
let devGeneratedJwtSecret = null;
let devGeneratedSessionSecret = null;

function getJwtSecret() {
  const envSecret = process.env.JWT_SECRET?.trim();
  
  if (IS_TEST) {
    return envSecret || 'test-jwt-secret';
  }

  const isInsecure = !envSecret || INSECURE_JWT_PLACEHOLDERS.includes(envSecret);

  if (isInsecure) {
    if (IS_PRODUCTION) {
      console.error('[CRITICAL SECURITY WARNING] JWT_SECRET is unset or using a placeholder in production! Add a strong JWT_SECRET in your Vercel Environment Variables.');
    } else {
      console.warn('[SECURITY NOTICE] JWT_SECRET is unset or using a weak default. Generated an ephemeral in-memory secret for this session. Set JWT_SECRET in backend/.env for persistent admin logins.');
    }
    if (!devGeneratedJwtSecret) {
      devGeneratedJwtSecret = crypto.randomBytes(32).toString('hex');
    }
    return devGeneratedJwtSecret;
  }

  return envSecret;
}

function getSessionSecret() {
  const envSecret = process.env.SESSION_SECRET?.trim();

  if (IS_TEST) {
    return envSecret || 'test-session-secret';
  }

  const isInsecure = !envSecret || INSECURE_SESSION_PLACEHOLDERS.includes(envSecret);

  if (isInsecure) {
    if (IS_PRODUCTION) {
      console.error('[CRITICAL SECURITY WARNING] SESSION_SECRET is unset or using a placeholder in production! Add a strong SESSION_SECRET in your Vercel Environment Variables.');
    } else {
      console.warn('[SECURITY NOTICE] SESSION_SECRET is unset or using a weak default. Generated an ephemeral in-memory secret for this session. Set SESSION_SECRET in backend/.env.');
    }
    if (!devGeneratedSessionSecret) {
      devGeneratedSessionSecret = crypto.randomBytes(32).toString('hex');
    }
    return devGeneratedSessionSecret;
  }

  return envSecret;
}

// Origin resolution
function getAllowedOrigins() {
  const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const origins = rawFrontendUrl.split(',').map((s) => s.trim()).filter(Boolean);
  
  if (!IS_PRODUCTION) {
    if (!origins.includes('http://localhost:5173')) origins.push('http://localhost:5173');
    if (!origins.includes('http://localhost:5174')) origins.push('http://localhost:5174');
    if (!origins.includes('http://localhost:3000')) origins.push('http://localhost:3000');
  }

  return origins;
}

function getPrimaryFrontendUrl() {
  const origins = getAllowedOrigins();
  return origins[0] || 'http://localhost:5173';
}

function getAdminCredentials() {
  return {
    username: (process.env.ADMIN_USERNAME || 'admin').trim(),
    passwordHash: process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH.trim() : null,
    isDefaultHash: process.env.ADMIN_PASSWORD_HASH?.trim() === DEFAULT_ADMIN_PASSWORD_HASH
  };
}

function getGoogleOAuthConfig() {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const callbackUrl = (process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback').trim();
  return {
    clientId,
    clientSecret,
    callbackUrl,
    isConfigured: Boolean(clientId && clientSecret)
  };
}

function getEmailConfig() {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
  return {
    user,
    pass,
    isConfigured: Boolean(user && pass)
  };
}

function auditSecurityConfig() {
  if (IS_TEST) return;

  console.log('\n🔒 --- Security & Environment Audit ---');
  console.log(`Environment:           ${NODE_ENV} (isProduction: ${IS_PRODUCTION})`);
  console.log(`Port:                  ${PORT}`);
  console.log(`Allowed CORS Origins:  ${getAllowedOrigins().join(', ')}`);
  
  // Admin Check
  const admin = getAdminCredentials();
  if (!admin.passwordHash) {
    console.error('❌ ADMIN_PASSWORD_HASH: MISSING! Admin login will fail.');
  } else if (admin.isDefaultHash) {
    console.warn('⚠️  ADMIN_PASSWORD_HASH: USING DEFAULT "admin123" HASH! Change before production deployment.');
  } else {
    console.log('✅ ADMIN_PASSWORD_HASH: Configured with custom hash.');
  }

  // JWT Secret Check
  const rawJwt = process.env.JWT_SECRET?.trim();
  if (!rawJwt || INSECURE_JWT_PLACEHOLDERS.includes(rawJwt)) {
    if (IS_PRODUCTION) {
      console.error('❌ JWT_SECRET: Insecure or missing in production!');
    } else {
      console.warn('⚠️  JWT_SECRET: Using dynamic ephemeral secret for local security.');
    }
  } else {
    console.log('✅ JWT_SECRET: Configured securely.');
  }

  // Session Secret Check
  const rawSession = process.env.SESSION_SECRET?.trim();
  if (!rawSession || INSECURE_SESSION_PLACEHOLDERS.includes(rawSession)) {
    if (IS_PRODUCTION) {
      console.error('❌ SESSION_SECRET: Insecure or missing in production!');
    } else {
      console.warn('⚠️  SESSION_SECRET: Using dynamic ephemeral secret for local security.');
    }
  } else {
    console.log('✅ SESSION_SECRET: Configured securely.');
  }

  // Email Service Check
  const email = getEmailConfig();
  console.log(`Email Service (SMTP):  ${email.isConfigured ? '✅ Configured (' + email.user + ')' : '⚠️  Unconfigured (Quotes will log to console)'}`);

  // Google OAuth Check
  const google = getGoogleOAuthConfig();
  console.log(`Google OAuth:          ${google.isConfigured ? '✅ Configured' : '⚠️  Unconfigured (Customer Google login disabled)'}`);

  console.log('----------------------------------------\n');
}

module.exports = {
  NODE_ENV,
  IS_PRODUCTION,
  IS_TEST,
  PORT,
  getJwtSecret,
  getSessionSecret,
  getAllowedOrigins,
  getPrimaryFrontendUrl,
  getAdminCredentials,
  getGoogleOAuthConfig,
  getEmailConfig,
  auditSecurityConfig,
  DEFAULT_ADMIN_PASSWORD_HASH,
  INSECURE_JWT_PLACEHOLDERS,
  INSECURE_SESSION_PLACEHOLDERS
};
