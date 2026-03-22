import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../src/services/SupabaseService';
import { Producao } from '../../../src/types/bovinext.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID da produção é obrigatório' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getProducao(id, res);
      case 'PUT':
        return await updateProducao(id, req, res);
      case 'DELETE':
        return await deleteProducao(id, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProducao(id: string, res: NextApiResponse) {
  const producao = await supabaseService.getProducaoById(id);
  
  if (!producao) {
    return res.status(404).json({ error: 'Produção não encontrada' });
  }

  return res.status(200).json({
    success: true,
    data: producao
  });
}

async function updateProducao(id: string, req: NextApiRequest, res: NextApiResponse) {
  const updateData: Partial<Producao> = req.body;
  const producaoAtualizada = await supabaseService.updateProducao(id, updateData);

  return res.status(200).json({
    success: true,
    data: producaoAtualizada,
    message: 'Produção atualizada com sucesso'
  });
}

async function deleteProducao(id: string, res: NextApiResponse) {
  await supabaseService.deleteProducao(id);

  return res.status(200).json({
    success: true,
    message: 'Produção removida com sucesso'
  });
}
