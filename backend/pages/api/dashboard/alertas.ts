import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../src/services/SupabaseService';
import { resolveRequestUserId } from '../../../src/utils/requestContext';
import { Alerta } from '../../../src/types/whilab.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const alertas = await generateAlertas(req);
    
    return res.status(200).json({
      success: true,
      data: alertas
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function generateAlertas(req: NextApiRequest): Promise<Alerta[]> {
  const userId = await resolveRequestUserId(req);
  if (!userId) {
    throw new Error('user_id ou token de autenticaÃ§Ã£o Ã© obrigatÃ³rio');
  }

  const alertas: Alerta[] = [];
  const rows = await supabaseService.getAlertas(userId);

  for (const alerta of rows) {
    alertas.push({
      id: alerta.id,
      tipo: String(alerta.tipo_alerta).toUpperCase(),
      prioridade: alerta.lido ? 'BAIXA' : 'ALTA',
      titulo: alerta.titulo,
      descricao: alerta.mensagem,
      dataVencimento: alerta.data_alerta,
      status: alerta.lido ? 'LIDO' : 'ATIVO',
      acoes: alerta.lido ? ['Marcar como nÃ£o lido'] : ['Marcar como lido']
    });
  }

  return alertas;
}

