import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../src/services/SupabaseService';
import { resolveRequestUserId } from '../../../src/utils/requestContext';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kpis = await calculateDashboardKPIs(req);
    
    return res.status(200).json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function calculateDashboardKPIs(req: NextApiRequest) {
  const userId = await resolveRequestUserId(req);
  if (!userId) {
    throw new Error('user_id ou token de autenticação é obrigatório');
  }

  const kpis = await supabaseService.getDashboardKPIs(userId);

  return {
    totalAnimais: kpis.totalAnimais,
    receitaMensal: kpis.receitaMensal,
    gmdMedio: kpis.gmdMedio,
    lucroMensal: kpis.lucroMensal,
    precoArroba: kpis.precoArroba,
    alertasAtivos: kpis.alertasAtivos,
    custoPorCabeca: kpis.custoPorCabeca,
    margemLucro: kpis.margemLucro,
    tendencias: kpis.tendencias
  };
}
