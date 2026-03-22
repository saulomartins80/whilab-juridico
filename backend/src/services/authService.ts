import { supabase, getSupabaseAnonClient } from '../config/supabase';
import { resolveRequestAuthContext } from '../utils/authContext';

const normalizeEmail = (value: unknown): string => {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
};

const normalizePassword = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeUserData = (userData: Record<string, any>): Record<string, any> => ({
  ...userData,
  email: normalizeEmail(userData.email),
  display_name: typeof userData.display_name === 'string' ? userData.display_name.trim() : userData.display_name,
  fazenda_nome: typeof userData.fazenda_nome === 'string' ? userData.fazenda_nome.trim() : userData.fazenda_nome
});

export class AuthService {
  private supabaseAdmin = supabase;

  private getSupabaseUserClient() {
    try {
      return getSupabaseAnonClient();
    } catch {
      return null;
    }
  }

  async login(email: string, password: string) {
    try {
      const client = this.getSupabaseUserClient();
      if (!client) {
        throw new Error('Cliente Supabase anonimo nao configurado');
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: normalizeEmail(email),
        password: normalizePassword(password)
      });

      if (error) throw error;
      if (!data.user) throw new Error('Usuario nao encontrado');

      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('users')
        .select('*')
        .eq('firebase_uid', data.user.id)
        .maybeSingle();

      if (profileError && (profileError as any).code !== 'PGRST116') {
        console.warn('Aviso: perfil nao encontrado para usuario:', data.user.id);
      }

      return {
        user: data.user,
        session: data.session,
        profile: profile || null
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(email: string, password: string, userData: any) {
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedPassword = normalizePassword(password);
      const normalizedUserData = normalizeUserData(userData || {});

      const { data, error } = await this.supabaseAdmin.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        options: {
          data: {
            name: normalizedUserData.display_name || normalizedUserData.name,
            fazenda: normalizedUserData.fazenda_nome
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Falha ao criar usuario');

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
            console.log(`Email confirmado automaticamente para: ${normalizedEmail}`);
          }
        } catch (confirmError) {
          console.warn('Nao foi possivel confirmar email automaticamente:', confirmError);
        }
      }

      const timestamp = new Date().toISOString();
      const userProfile = {
        id: confirmedUser.id,
        firebase_uid: confirmedUser.id,
        email: normalizedEmail,
        ...normalizedUserData,
        created_at: timestamp,
        updated_at: timestamp,
        subscription_plan: normalizedUserData.subscription_plan || 'fazendeiro',
        subscription_status: normalizedUserData.subscription_status || 'active'
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
    return { success: true };
  }

  async getSession(token?: string) {
    if (!token) {
      return null;
    }

    const context = await resolveRequestAuthContext({ headers: { authorization: `Bearer ${token}` } });
    return context
      ? {
          user: context.user,
          profile: context.profile,
          access_token: token
        }
      : null;
  }

  async getUser(token?: string) {
    const session = await this.getSession(token);
    return session?.user || null;
  }
}

export const authService = new AuthService();
