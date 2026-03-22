import { Request } from 'express';

export interface AuthUser {
  _id: string;
  uid: string;
  id?: string;
  firebaseUid: string;
  email?: string;
  name?: string;
  display_name?: string;
  fazenda_nome?: string;
  subscription_plan?: string;
  subscription_status?: string;
  subscription?: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status?: string;
    plan?: string;
  };
  [key: string]: any;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
