import { NextApiRequest, NextApiResponse } from 'next';
import { whilabSupabaseService } from '../../../src/services/WhiLabSupabaseService';
import { resolveRequestAuthContext } from '../../../src/utils/authContext';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authContext = await resolveRequestAuthContext(req);

  if (!authContext?.userId) {
    return res.status(401).json({ error: 'NÃ£o autenticado' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        return res.status(200).json(authContext.profile || null);
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
    console.error('Erro na rota /api/auth/profile:', error);

    if (error?.message === 'UsuÃ¡rio nÃ£o encontrado' || String(error?.message || '').includes('ValidaÃ§Ã£o')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro interno do servidor ao processar perfil.' });
  }
}

