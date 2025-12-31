import supabase from '../config/supabase';

export interface IInvestimento {
  id?: string;
  user_id: string;
  nome: string;
  tipo: string;
  valor: number;
  data: string;
  instituicao?: string;
  rentabilidade?: number;
  vencimento?: string;
  liquidez?: string;
  risco?: string;
  categoria?: string;
  created_at?: string;
  updated_at?: string;
}

export class Investimento {
  static async create(investimentoData: Omit<IInvestimento, 'id' | 'created_at' | 'updated_at'>): Promise<IInvestimento> {
    const { data, error } = await supabase
      .from('investimentos')
      .insert([{
        ...investimentoData,
        data: investimentoData.data || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating investment:', error);
      throw error;
    }

    return data;
  }

  static async findByUserId(userId: string, limit?: number): Promise<IInvestimento[]> {
    let query = supabase
      .from('investimentos')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching investments:', error);
      throw error;
    }

    return data || [];
  }

  static async findById(id: string): Promise<IInvestimento | null> {
    const { data, error } = await supabase
      .from('investimentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching investment:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, updateData: Partial<Omit<IInvestimento, 'id' | 'created_at' | 'updated_at'>>): Promise<IInvestimento> {
    const { data, error } = await supabase
      .from('investimentos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating investment:', error);
      throw error;
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('investimentos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }
  }

  static async getByType(userId: string, tipo: string): Promise<IInvestimento[]> {
    const { data, error } = await supabase
      .from('investimentos')
      .select('*')
      .eq('user_id', userId)
      .eq('tipo', tipo)
      .order('data', { ascending: false });

    if (error) {
      console.error('Error fetching investments by type:', error);
      throw error;
    }

    return data || [];
  }

  static async getTotalByType(userId: string, tipo: string): Promise<number> {
    const { data, error } = await supabase
      .from('investimentos')
      .select('valor')
      .eq('user_id', userId)
      .eq('tipo', tipo);

    if (error) {
      console.error('Error calculating total by type:', error);
      throw error;
    }

    return (data || []).reduce((sum, investment) => sum + investment.valor, 0);
  }

  static async getTotalValue(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('investimentos')
      .select('valor')
      .eq('user_id', userId);

    if (error) {
      console.error('Error calculating total investment value:', error);
      throw error;
    }

    return (data || []).reduce((sum, investment) => sum + investment.valor, 0);
  }

  static async getByInstitution(userId: string, instituicao: string): Promise<IInvestimento[]> {
    const { data, error } = await supabase
      .from('investimentos')
      .select('*')
      .eq('user_id', userId)
      .eq('instituicao', instituicao)
      .order('data', { ascending: false });

    if (error) {
      console.error('Error fetching investments by institution:', error);
      throw error;
    }

    return data || [];
  }
}

export default Investimento;
