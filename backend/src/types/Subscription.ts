// types/Subscription.ts - Tipos para assinaturas
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  features: string[];
  stripePriceId?: string;
  stripeProductId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionUsage {
  id: string;
  subscriptionId: string;
  feature: string;
  limit: number;
  used: number;
  resetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  paidAt?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
