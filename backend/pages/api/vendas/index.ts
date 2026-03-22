import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../src/services/SupabaseService';
import { resolveRequestUserId } from '../../../src/utils/requestContext';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getVendas(req, res);
      case 'POST':
        return await createVenda(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getVendas(req: NextApiRequest, res: NextApiResponse) {
  const userId = await resolveRequestUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'user_id ou token de autenticação é obrigatório' });
  }

  const { search, limit = '50', offset = '0', tipoVenda } = req.query;
  const vendas = await supabaseService.getVendas({
    userId,
    filters: tipoVenda ? { tipoVenda } : undefined,
    search: search as string,
    limit: Number(limit),
    offset: Number(offset)
  });

  return res.status(200).json({
    success: true,
    data: vendas,
    count: vendas.length
  });
}

async function createVenda(req: NextApiRequest, res: NextApiResponse) {
  const userId = await resolveRequestUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'user_id ou token de autenticação é obrigatório' });
  }

  const vendaData = {
    ...req.body,
    user_id: userId
  };

  const novaVenda = await supabaseService.createVenda(vendaData);

  return res.status(201).json({
    success: true,
    data: novaVenda,
    message: 'Venda criada com sucesso'
  });
}
