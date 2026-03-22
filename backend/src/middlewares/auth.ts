import { Response, NextFunction } from 'express';
import { resolveRequestAuthContext } from '../utils/authContext';
import { AuthRequest } from '../types/auth';

/**
 * Middleware para autenticação via JWT do Supabase
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authContext = await resolveRequestAuthContext(req);

    if (!authContext) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticacao nao fornecido ou invalido'
      });
      return;
    }

    req.user = {
      ...authContext.user,
      subscription: authContext.profile
        ? {
            stripeCustomerId: (authContext.profile as any)?.stripe_customer_id,
            stripeSubscriptionId: (authContext.profile as any)?.stripe_subscription_id,
            status: (authContext.profile as any)?.subscription_status,
            plan: (authContext.profile as any)?.subscription_plan
          }
        : authContext.user.subscription
    };

    next();
  } catch (error: any) {
    console.error('Erro na autenticacao:', error);
    res.status(401).json({
      success: false,
      message: 'Falha na autenticacao',
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
        message: 'Usuario nao autenticado'
      });
      return;
    }

    if (!req.user.fazenda_nome) {
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
      message: 'Erro ao verificar perfil do usuario',
      error: error.message
    });
  }
};
