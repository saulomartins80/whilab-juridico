// config/stripe.ts - Configuração do Stripe
import Stripe from 'stripe';

// Configuração do Stripe
export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'brl',
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3001/success',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:3001/cancel',
};

// Instância do Stripe
export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Função para criar sessão de pagamento
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
    console.error('Erro ao criar sessão de checkout:', error);
    throw error;
  }
}

// Função para criar cliente
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

// Função para listar produtos
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

// Função para listar preços
export async function listPrices() {
  try {
    const prices = await stripe.prices.list({
      active: true,
    });

    return prices;
  } catch (error) {
    console.error('Erro ao listar preços:', error);
    throw error;
  }
}

// Função para verificar webhook
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
