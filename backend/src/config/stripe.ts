import Stripe from 'stripe';

import { buildFrontendUrl } from './runtime';

export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'brl',
  successUrl: process.env.STRIPE_SUCCESS_URL || buildFrontendUrl('/success'),
  cancelUrl: process.env.STRIPE_CANCEL_URL || buildFrontendUrl('/cancel'),
};

export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export async function createCheckoutSession(priceId: string, customerEmail?: string) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      customer_email: customerEmail,
    });

    return session;
  } catch (error) {
    console.error('Erro ao criar sessao de checkout:', error);
    throw error;
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });

    return customer;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
}

export async function listProducts() {
  try {
    const products = await stripe.products.list({
      active: true,
    });

    return products;
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    throw error;
  }
}

export async function listPrices() {
  try {
    const prices = await stripe.prices.list({
      active: true,
    });

    return prices;
  } catch (error) {
    console.error('Erro ao listar precos:', error);
    throw error;
  }
}

export function verifyWebhookSignature(payload: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.webhookSecret
    );

    return event;
  } catch (error) {
    console.error('Erro ao verificar webhook:', error);
    throw error;
  }
}
