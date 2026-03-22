import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  return res.status(410).json({
    error: 'Endpoint legado',
    message: 'A autenticação Google foi consolidada no fluxo Supabase do backend.'
  });
}
