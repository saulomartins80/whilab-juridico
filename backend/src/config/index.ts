import { buildFrontendUrl, runtimeConfig } from './runtime';

export const config = {
  projectKey: runtimeConfig.projectKey,
  brandName: runtimeConfig.brandName,
  backendUrl: runtimeConfig.backendUrl,
  frontendUrl: runtimeConfig.frontendUrl,
  allowedOrigins: runtimeConfig.allowedOrigins,
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }
};

export { buildFrontendUrl, runtimeConfig };
