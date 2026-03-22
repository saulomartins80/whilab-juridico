import { NextApiRequest, NextApiResponse } from 'next';
import { runtimeConfig } from '../../../src/config/runtime';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'POST') {
    return res.status(410).json({
      error: 'Endpoint legado',
      message: `NextAuth nao e mais usado no backend ${runtimeConfig.brandName}.`
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Método ${req.method} não permitido`);
}
