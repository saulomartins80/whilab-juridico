import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../src/services/SupabaseService';
import { resolveRequestUserId } from '../../../src/utils/requestContext';
import { Manejo } from '../../../src/types/bovinext.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getManejos(req, res);
      case 'POST':
        return await createManejo(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getManejos(req: NextApiRequest, res: NextApiResponse) {
  const userId = await resolveRequestUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'user_id ou token de autenticação é obrigatório' });
  }

  const { 
    tipo, 
    status, 
    responsavel, 
    dataInicio,
    dataFim,
    search,
    limit = '50',
    offset = '0'
  } = req.query;

  const filters: any = {};
  if (tipo) filters.tipo = tipo;
  if (status) filters.status = status;
  if (responsavel) filters.responsavel = responsavel;
  if (dataInicio) filters.dataInicio = new Date(dataInicio as string);
  if (dataFim) filters.dataFim = new Date(dataFim as string);

  const manejos = await supabaseService.getManejos({
    userId,
    filters,
    search: search as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });

  return res.status(200).json({
    success: true,
    data: manejos,
    count: manejos.length
  });
}

async function createManejo(req: NextApiRequest, res: NextApiResponse) {
  const userId = await resolveRequestUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'user_id ou token de autenticação é obrigatório' });
  }

  const manejoData: Omit<Manejo, 'id'> = req.body;
  const tipo = (manejoData as any).tipo || (manejoData as any).tipo_manejo;
  const animais = (manejoData as any).animais || (manejoData as any).animal_id;
  const data = (manejoData as any).data || (manejoData as any).data_manejo;
  const responsavel = (manejoData as any).responsavel || (manejoData as any).veterinario;

  // Validação básica
  if (!tipo || !animais || !data || !responsavel) {
    return res.status(400).json({
      error: 'Campos obrigatórios: tipo, animais, data, responsavel (ou tipo_manejo, animal_id, data_manejo, veterinario)'
    });
  }

  const novoManejo = await supabaseService.createManejo({
    ...manejoData,
    user_id: userId
  });

  return res.status(201).json({
    success: true,
    data: novoManejo,
    message: 'Manejo criado com sucesso'
  });
}
