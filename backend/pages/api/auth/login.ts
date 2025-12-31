// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', ['POST']).status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  try {
    return res.status(501).json({
      error: 'Deprecated endpoint',
      message: 'Use Supabase Auth no frontend (AuthContext) para login. Este endpoint foi descontinuado.'
    });

  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      // Evita lint de console em produção
      // eslint-disable-next-line no-console
      console.error('Login error (deprecated endpoint):', error);
    }
    return res.status(500).json({ 
      error: 'Erro durante o login',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}