// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro no registro:', data);
      return res.status(response.status).json(data);
    }

    return res.status(201).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Erro no handler de registro:', message);
    return res.status(502).json({ 
      error: 'Backend unreachable',
      message: 'Não foi possível conectar ao backend. Verifique NEXT_PUBLIC_BACKEND_URL e se o backend está rodando.',
      details: message
    });
  }
}