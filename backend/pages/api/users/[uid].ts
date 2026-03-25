import { NextApiRequest, NextApiResponse } from 'next';
import { whilabSupabaseService } from '../../../src/services/WhiLabSupabaseService';
import { resolveRequestAuthContext } from '../../../src/utils/authContext';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authContext = await resolveRequestAuthContext(req);

  if (!authContext) {
    return res.status(401).json({ error: 'NÃ£o autenticado' });
  }

  const { uid } = req.query;
  if (typeof uid !== 'string' || !uid.trim()) {
    return res.status(400).json({ error: 'UID invÃ¡lido' });
  }

  if (uid !== authContext.userId) {
    return res.status(403).json({ error: 'Acesso nÃ£o autorizado' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const profile = await whilabSupabaseService.getUserProfile(authContext.userId);
        return res.status(200).json(profile);
      }
      case 'PUT': {
        const updatedProfile = await whilabSupabaseService.updateUserProfile(authContext.userId, req.body || {});
        return res.status(200).json(updatedProfile);
      }
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).end(`MÃ©todo ${req.method} nÃ£o permitido`);
    }
  } catch (error: any) {
    console.error('Erro na rota /api/users/[uid]:', error);

    if (error?.message === 'UsuÃ¡rio nÃ£o encontrado' || String(error?.message || '').includes('ValidaÃ§Ã£o')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro interno do servidor ao processar perfil.' });
  }
}

