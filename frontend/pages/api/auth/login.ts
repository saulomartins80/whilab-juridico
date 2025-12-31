// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Configura cookies de sessão
    res.setHeader('Set-Cookie', [
      `token=${data.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      `user=${encodeURIComponent(JSON.stringify(data.user))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`, // Adicionado HttpOnly
    ]);

    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Login API error:', message);
    // 502 indica falha ao contatar backend
    return res.status(502).json({
      error: 'Backend unreachable',
      message: 'Não foi possível conectar ao backend. Verifique NEXT_PUBLIC_BACKEND_URL e se o backend está rodando.',
      details: message,
    });
  }
}