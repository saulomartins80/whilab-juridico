import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService';
import logger from '../utils/logger';
import { buildFrontendUrl } from '../config/runtime';
import { extractRequestToken } from '../utils/authContext';

const normalizeString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Tentativa de login com dados invalidos', {
          errors: errors.array(),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          message: 'Dados de entrada invalidos',
          errors: errors.array()
        });
      }

      const email = normalizeString(req.body?.email).toLowerCase();
      const password = normalizeString(req.body?.password);

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha sao obrigatorios'
        });
      }

      const { user, session, profile } = await authService.login(email, password);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          ...(profile || {})
        },
        access_token: session?.access_token,
        refresh_token: session?.refresh_token
      });
    } catch (error: any) {
      console.error('Erro no login:', error);

      if (error.message === 'Invalid login credentials') {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha invalidos'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
        error: error.message
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      req.body = {
        ...req.body,
        email: normalizeString(req.body.email).toLowerCase(),
        password: normalizeString(req.body.password),
        display_name: normalizeString(req.body.display_name),
        fazenda_nome: normalizeString(req.body.fazenda_nome)
      };

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Tentativa de registro com dados invalidos', {
          errors: errors.array(),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          message: 'Dados de entrada invalidos',
          errors: errors.array()
        });
      }

      const { email, password, ...userData } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha sao obrigatorios'
        });
      }

      if ((password as string).length < 8) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 8 caracteres'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email as string)) {
        return res.status(400).json({
          success: false,
          message: 'Email invalido'
        });
      }

      const { user, session, profile, emailConfirmed } = await authService.register(email as string, password as string, userData);

      res.status(201).json({
        success: true,
        message: 'Usuario criado com sucesso. Voce ja pode fazer login.',
        user: {
          id: user.id,
          email: user.email,
          ...(profile || {})
        },
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
        emailConfirmed
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);

      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Este email ja esta em uso'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuario',
        error: error.message
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      await authService.logout();
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    } catch (error: any) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer logout',
        error: error.message
      });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const token = extractRequestToken(req);
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Nao autenticado'
        });
      }

      const session = await authService.getSession(token);
      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Nao autenticado'
        });
      }

      res.json({
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          ...((session.profile as Record<string, unknown>) || {})
        }
      });
    } catch (error: any) {
      console.error('Erro ao verificar sessao:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar sessao',
        error: error.message
      });
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const email = normalizeString(req.body?.email).toLowerCase();
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email e obrigatorio'
        });
      }

      const { supabase } = require('../config/supabase');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: buildFrontendUrl('/auth/confirm-email')
        }
      });

      if (error) throw error;

      res.json({
        success: true,
        message: 'Email de verificacao reenviado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao reenviar email de verificacao:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao reenviar email de verificacao',
        error: error.message
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const email = normalizeString(req.body?.email).toLowerCase();
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email e obrigatorio' });
      }

      const { supabase } = require('../config/supabase');
      const redirectTo = buildFrontendUrl('/auth/reset-password');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (error) throw error;

      res.json({ success: true, message: 'Enviamos um email para redefinir sua senha.' });
    } catch (error: any) {
      console.error('Erro ao solicitar reset de senha:', error);
      res.status(500).json({ success: false, message: 'Erro ao solicitar reset de senha', error: error.message });
    }
  }

  async adminResetPassword(req: Request, res: Response) {
    try {
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) {
        return res.status(400).json({ success: false, message: 'userId e newPassword sao obrigatorios' });
      }

      const { supabase } = require('../config/supabase');
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });
      if (error) throw error;

      res.json({ success: true, message: 'Senha atualizada com sucesso', userId: data.user.id });
    } catch (error: any) {
      console.error('Erro no adminResetPassword:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar senha', error: error.message });
    }
  }

  async confirmEmail(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId e obrigatorio' });
      }

      const { supabase } = require('../config/supabase');
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true
      });
      if (error) throw error;

      res.json({
        success: true,
        message: 'Email confirmado com sucesso',
        userId: data.user.id,
        emailConfirmed: true
      });
    } catch (error: any) {
      console.error('Erro ao confirmar email:', error);
      res.status(500).json({ success: false, message: 'Erro ao confirmar email', error: error.message });
    }
  }
}

export const authController = new AuthController();
