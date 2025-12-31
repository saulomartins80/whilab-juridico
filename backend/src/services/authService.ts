import { supabase } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

export class AuthService {
  private supabaseAdmin = supabase;

  // Cliente separado para operações do usuário (com RLS)
  private supabaseUser = null;

  private getSupabaseUserClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    if (!this.supabaseUser) {
      this.supabaseUser = createClient(supabaseUrl, supabaseAnonKey);
    }

    return this.supabaseUser;
  }

  async login(email: string, password: string) {
    try {
      // Usar o cliente do usuário para login (respeita RLS)
      const { data, error } = await this.getSupabaseUserClient()?.auth.signInWithPassword({
        email,
        password,
      }) || { data: null, error: new Error('Cliente não configurado') };

      if (error) throw error;
      if (!data.user) throw new Error('Usuário não encontrado');

      // Buscar perfil do usuário usando o cliente admin para evitar problemas de RLS
      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('users')
        .select('*')
        .eq('firebase_uid', data.user.id)
        .maybeSingle();

      // Se não encontrou perfil, não é erro fatal - retornar sem perfil
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Aviso: Perfil não encontrado para usuário:', data.user.id);
      }

      return {
        user: data.user,
        session: data.session,
        profile
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(email: string, password: string, userData: any) {
    try {
      // 1. Criar usuário no Auth usando o cliente admin
      const { data, error } = await this.supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            fazenda: userData.fazenda_nome
          },
          // Não depender de confirmação por e-mail; backend confirmará abaixo
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Falha ao criar usuário');

      // 2. Confirmar email automaticamente (sempre pelo backend)
      let confirmedUser = data.user;
      if (!data.user.email_confirmed_at) {
        try {
          const { data: confirmedData, error: confirmError } = await this.supabaseAdmin.auth.admin.updateUserById(
            data.user.id,
            { email_confirm: true }
          );
          if (confirmError) throw confirmError;
          if (confirmedData?.user) {
            confirmedUser = confirmedData.user;
            console.log(`✅ Email confirmado automaticamente para: ${email}`);
          }
        } catch (confirmError) {
          console.warn('⚠️ Não foi possível confirmar email automaticamente:', confirmError);
        }
      }

      // 3. Criar perfil na tabela users (usando service role para evitar problemas de RLS)
      const userProfile = {
        id: confirmedUser.id,
        firebase_uid: confirmedUser.id,
        email,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subscription_plan: userData.subscription_plan || 'fazendeiro',
        subscription_status: userData.subscription_status || 'active'
      };

      const { data: profile, error: profileError } = await (this.supabaseAdmin as any)
        .from('users')
        .insert(userProfile)
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        user: confirmedUser,
        session: data.session,
        profile,
        emailConfirmed: !!confirmedUser.email_confirmed_at
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const { error } = await this.supabaseAdmin.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  async getSession() {
    try {
      const { data, error } = await this.supabaseAdmin.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      throw error;
    }
  }

  async getUser() {
    try {
      const { data: { user }, error } = await this.supabaseAdmin.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
