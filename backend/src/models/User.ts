import supabase from '../config/supabase';

export interface IUser {
  id?: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  fazenda_nome?: string;
  fazenda_area?: number;
  fazenda_localizacao?: string;
  tipo_criacao?: string;
  experiencia_anos?: number;
  subscription_plan: string;
  subscription_status: string;
  stripe_customer_id?: string;
  preferences?: {
    currency?: string;
    language?: string;
    notifications?: boolean;
    theme?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export class User {
  static async create(userData: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): Promise<IUser> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...userData,
        subscription_plan: userData.subscription_plan || 'fazendeiro',
        subscription_status: userData.subscription_status || 'active',
        preferences: userData.preferences || {
          currency: 'BRL',
          language: 'pt-BR',
          notifications: true,
          theme: 'light'
        }
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  }

  static async findByFirebaseUid(firebaseUid: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching user by Firebase UID:', error);
      throw error;
    }

    return data;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching user by email:', error);
      throw error;
    }

    return data;
  }

  static async findById(id: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching user by ID:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, updateData: Partial<Omit<IUser, 'id' | 'created_at' | 'updated_at'>>): Promise<IUser> {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return data;
  }

  static async updateByFirebaseUid(firebaseUid: string, updateData: Partial<Omit<IUser, 'id' | 'created_at' | 'updated_at'>>): Promise<IUser> {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    if (error) {
      console.error('Error updating user by Firebase UID:', error);
      throw error;
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async updateSubscription(firebaseUid: string, subscriptionData: {
    plan: string;
    status: string;
    stripeCustomerId?: string;
  }): Promise<IUser> {
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_plan: subscriptionData.plan,
        subscription_status: subscriptionData.status,
        stripe_customer_id: subscriptionData.stripeCustomerId
      })
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    if (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }

    return data;
  }

  static async updatePreferences(firebaseUid: string, preferences: Partial<IUser['preferences']>): Promise<IUser> {
    // Buscar preferências atuais
    const user = await this.findByFirebaseUid(firebaseUid);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };

    const { data, error } = await supabase
      .from('users')
      .update({ preferences: updatedPreferences })
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    if (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }

    return data;
  }

  static async getActiveSubscribers(): Promise<IUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('subscription_status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active subscribers:', error);
      throw error;
    }

    return data || [];
  }

  static async getBySubscriptionPlan(plan: string): Promise<IUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('subscription_plan', plan)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users by subscription plan:', error);
      throw error;
    }

    return data || [];
  }
}

export default User;
