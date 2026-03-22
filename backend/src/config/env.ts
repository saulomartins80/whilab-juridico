import { runtimeConfig, validateRuntimeConfig } from './runtime';

validateRuntimeConfig();

export const env = {
  projectKey: runtimeConfig.projectKey,
  brandName: runtimeConfig.brandName,
  backendUrl: runtimeConfig.backendUrl,
  frontendUrl: runtimeConfig.frontendUrl,
  allowedOrigins: runtimeConfig.allowedOrigins,
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT || '4000',
  nodeEnv: process.env.NODE_ENV || 'development',
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS || '900000',
  rateLimitMax: process.env.RATE_LIMIT_MAX || '1000',
  appJwtSecret: process.env.APP_JWT_SECRET,
  jwtSecret: process.env.JWT_SECRET || process.env.APP_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-key-change-in-production',
  firebaseAdminCredentials: process.env.FIREBASE_ADMIN_CREDENTIALS,
  firebaseAdminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  firebaseAdminClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  firebaseAdminPrivateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  firebaseDatabaseUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  openweatherApiKey: process.env.OPENWEATHER_API_KEY,
  pluggyClientId: process.env.PLUGGY_CLIENT_ID,
  pluggyApiKey: process.env.PLUGGY_API_KEY
};
