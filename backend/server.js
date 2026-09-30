const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore fallback if custom servers not allowed
}
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const logger = require('./utils/logger');

// Global error handlers to prevent unhandled rejection crashes from killing the server
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection caught:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception caught:', err?.message || err);
});

const { prisma, initializePersistence, isPlaceholderMongoUri } = require('./config/state');
const { logRouteError, withTimeout } = require('./utils/helpers');
const {
  PORT,
  IS_PRODUCTION,
  getSessionSecret,
  getAllowedOrigins,
  getGoogleOAuthConfig,
  auditSecurityConfig
} = require('./config/env');

// Import routers
const authRouter = require('./routes/auth.routes');
const customerRouter = require('./routes/customer.routes');
const adminRouter = require('./routes/admin.routes');
const quotesRouter = require('./routes/quotes.routes');
const reviewsRouter = require('./routes/reviews.routes');
const productsRouter = require('./routes/products.routes');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = getAllowedOrigins();
const googleOAuthConfig = getGoogleOAuthConfig();
const GOOGLE_AUTH_CONFIGURED = googleOAuthConfig.isConfigured;

const SESSION_MONGO_URL = process.env.MONGODB_URI || process.env.DATABASE_URL;
const USE_MONGO_SESSION_STORE = Boolean(SESSION_MONGO_URL && !isPlaceholderMongoUri(SESSION_MONGO_URL));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (server-to-server, curl, tests)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      /\.vercel\.app$/i.test(origin)
    ) {
      return callback(null, true);
    }

    if (!IS_PRODUCTION) {
      // In development, permit localhost ports and 127.0.0.1
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

app.use(express.json());
app.use(cookieParser());

const sessionConfig = {
  secret: getSessionSecret(),
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/'
  }
};

if (USE_MONGO_SESSION_STORE) {
  try {
    const store = MongoStore.create({
      mongoUrl: SESSION_MONGO_URL.trim(),
      ttl: 14 * 24 * 60 * 60,
      touchAfter: 24 * 3600
    });
    store.on('error', (err) => {
      logger.warn('MongoStore session store connection error (memory session active):', err.message || err);
    });
    sessionConfig.store = store;
    logger.info('MongoStore session store initialized');
  } catch (err) {
    logger.error('Failed to initialize MongoStore:', err);
  }
} else {
  logger.info('Using memory session store (MONGODB_URI is unconfigured or placeholder)');
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

if (GOOGLE_AUTH_CONFIGURED) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID.trim(),
    clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
    callbackURL: (process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback').trim()
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('Google account email is required'));

      let customer = await prisma.customer.findUnique({ where: { googleId: profile.id } });
      if (!customer) {
        const existingByEmail = await prisma.customer.findUnique({ where: { email } });
        customer = existingByEmail
          ? await prisma.customer.update({
              where: { id: existingByEmail.id },
              data: {
                googleId: profile.id,
                name: existingByEmail.name || profile.displayName,
                avatar: profile.photos?.[0]?.value || existingByEmail.avatar || null,
              }
            })
          : await prisma.customer.create({
              data: {
                googleId: profile.id,
                email,
                name: profile.displayName || email.split('@')[0],
                avatar: profile.photos?.[0]?.value || null,
              }
            });
      }
      return done(null, customer);
    } catch (err) {
      return done(err);
    }
  }));
} else {
  logger.warn('Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env to enable customer login.');
}

passport.serializeUser((customer, done) => done(null, customer.id));
passport.deserializeUser(async (id, done) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    done(null, customer);
  } catch (err) {
    done(err);
  }
});

// Audit and display secure environment configuration
auditSecurityConfig();

// Run initialization in the background
initializePersistence();

// Health Check Route
app.get('/api/health', async (req, res) => {
  const envStatus = {
    isVercel: Boolean(process.env.VERCEL),
    nodeEnv: process.env.NODE_ENV || 'development',
    googleAuth: GOOGLE_AUTH_CONFIGURED ? 'configured' : 'missing credentials',
    emailService: process.env.EMAIL_USER && process.env.EMAIL_PASS ? 'configured' : 'unconfigured',
    jwtSecret: process.env.JWT_SECRET ? 'configured' : 'ephemeral_fallback',
    sessionSecret: process.env.SESSION_SECRET ? 'configured' : 'ephemeral_fallback',
    adminConfigured: Boolean(process.env.ADMIN_PASSWORD_HASH)
  };

  try {
    if (isPlaceholderMongoUri(process.env.MONGODB_URI)) {
      return res.json({
        ok: true,
        database: 'unconfigured_local_mode',
        message: 'Backend is running with local catalog and JSON persistence.',
        ...envStatus
      });
    }
    await withTimeout(
      prisma.$runCommandRaw({ ping: 1 }),
      5000,
      'MongoDB did not respond within 5 seconds. Check MONGODB_URI, network access, and Atlas IP allowlist.'
    );
    res.json({
      ok: true,
      database: 'connected',
      ...envStatus
    });
  } catch (error) {
    logRouteError('Health check database unreachable', error);
    res.json({
      ok: true,
      database: 'unreachable_using_fallback',
      error: error.message,
      ...envStatus
    });
  }
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api', productsRouter);

// Global Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

const isDirectRun = require.main === module || (
  require.main &&
  require.main.filename &&
  !require.main.filename.includes('test') &&
  (require.main.filename.endsWith('server.js') ||
   require.main.filename.endsWith('backend.js') ||
   require.main.filename.endsWith('index.js'))
);

if (isDirectRun) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;
