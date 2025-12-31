import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/authService';
import logger from '../utils/logger';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Tentativa de login com dados inválidos', {
          errors: errors.array(),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Validação adicional
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      // Sanitização básica
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      const { user, session, profile } = await authService.login(email, password);
      
      // Verificação de email desabilitada (backend confirma automaticamente)

      // Criar objeto de usuário com tipos explícitos
      const userResponse = {
        id: user.id,
        email: user.email,
        ...(profile || {})
      };
      
      res.json({
        success: true,
        user: userResponse,
        access_token: session?.access_token,
        refresh_token: session?.refresh_token
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      if (error.message === 'Invalid login credentials') {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
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
      // Sanitização básica antecipada
      req.body = {
        ...req.body,
        email: typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email,
        password: typeof req.body.password === 'string' ? req.body.password.trim() : req.body.password,
        display_name: typeof req.body.display_name === 'string' ? req.body.display_name.trim() : req.body.display_name,
        fazenda_nome: typeof req.body.fazenda_nome === 'string' ? req.body.fazenda_nome.trim() : req.body.fazenda_nome,
      };

      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Tentativa de registro com dados inválidos', {
          errors: errors.array(),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: errors.array()
        });
      }

      const { email, password, ...userData } = req.body;

      // Validação adicional
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      // Sanitização básica
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      // Validação de senha forte
      if (sanitizedPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 8 caracteres'
        });
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      const { user, session, profile, emailConfirmed } = await authService.register(email, password, userData);

      // Criar objeto de usuário com tipos explícitos
      const userResponse = {
        id: user.id,
        email: user.email,
        ...(profile || {})
      };

      // Mensagem baseada no status de confirmação
      const message = 'Usuário criado com sucesso. Você já pode fazer login.';

      res.status(201).json({
        success: true,
        message,
        user: userResponse,
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
        emailConfirmed
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
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
      const session = await authService.getSession();
      
      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Não autenticado'
        });
      }
      
      const user = await authService.getUser();
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // Importar o cliente Supabase
      const { supabase } = require('../config/supabase');
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          ...profile
        }
      });
    } catch (error: any) {
      console.error('Erro ao verificar sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar sessão',
        error: error.message
      });
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }
      
      // Importar o cliente Supabase
      const { supabase } = require('../config/supabase');
      
      // Isso envia um email de confirmação para o usuário
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL}/auth/confirm-email`
        }
      });
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: 'Email de verificação reenviado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao reenviar email de verificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao reenviar email de verificação',
        error: error.message
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email é obrigatório' });
      }

      const { supabase } = require('../config/supabase');
      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/reset-password`;

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
        return res.status(400).json({ success: false, message: 'userId e newPassword são obrigatórios' });
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
        return res.status(400).json({ success: false, message: 'userId é obrigatório' });
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
