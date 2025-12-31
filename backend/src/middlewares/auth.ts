import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../types/auth';

/**
 * Middleware para autenticação via JWT do Supabase
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Suporta Authorization: Bearer <token> ou query ?token=<token> (SSE / EventSource)
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    } else if (typeof req.query.token === 'string' && req.query.token.length > 20) {
      token = req.query.token as string;
    }

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'Token de autenticação não fornecido' 
      });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new Error('Token inválido ou expirado');
    }
    
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', user.id)
      .maybeSingle();

    if (profileError && (profileError as any)?.code !== 'PGRST116') {
      throw profileError;
    }
    
    req.user = {
      _id: user.id,
      id: user.id,
      uid: user.id,
      firebaseUid: user.id,
      email: user.email || '',
      fazenda_nome: (profileData as any)?.fazenda_nome,
      display_name: (profileData as any)?.display_name,
      subscription_plan: (profileData as any)?.subscription_plan,
      subscription_status: (profileData as any)?.subscription_status
    } as any;

    next();
  } catch (error: any) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ 
      success: false,
      message: 'Falha na autenticação',
      error: error.message 
    });
  }
};

/**
 * Middleware para verificar se o usuário tem um perfil completo
 */
export const checkProfileComplete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        message: 'Usuário não autenticado' 
      });
      return;
    }

    // Verificar se o perfil está completo
    if (!(req.user as any).fazenda_nome) {
      res.status(403).json({ 
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Seu perfil precisa ser completado antes de continuar' 
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error('Erro ao verificar perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao verificar perfil do usuário',
      error: error.message 
    });
  }
};