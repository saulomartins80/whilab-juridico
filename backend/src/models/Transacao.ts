import supabase from '../config/supabase';

export interface ITransacao {
  id?: string;
  user_id: string;
  valor: number;
  descricao: string;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria: string;
  conta: string;
  data: string;
  forma_pagamento?: string;
  created_at?: string;
  updated_at?: string;
}

export class Transacao {
  static async create(transacaoData: Omit<ITransacao, 'id' | 'created_at' | 'updated_at'>): Promise<ITransacao> {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([{
        ...transacaoData,
        data: transacaoData.data || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return data;
  }

  static async findByUserId(userId: string, limit?: number): Promise<ITransacao[]> {
    let query = supabase
      .from('transacoes')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return data || [];
  }

  static async findById(id: string): Promise<ITransacao | null> {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching transaction:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, updateData: Partial<Omit<ITransacao, 'id' | 'created_at' | 'updated_at'>>): Promise<ITransacao> {
    const { data, error } = await supabase
      .from('transacoes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  static async getByCategory(userId: string, categoria: string): Promise<ITransacao[]> {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_id', userId)
      .eq('categoria', categoria)
      .order('data', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by category:', error);
      throw error;
    }

    return data || [];
  }

  static async getByDateRange(userId: string, startDate: string, endDate: string): Promise<ITransacao[]> {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_id', userId)
      .gte('data', startDate)
      .lte('data', endDate)
      .order('data', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }

    return data || [];
  }

  static async getTotalByType(userId: string, tipo: 'receita' | 'despesa'): Promise<number> {
    const { data, error } = await supabase
      .from('transacoes')
      .select('valor')
      .eq('user_id', userId)
      .eq('tipo', tipo);

    if (error) {
      console.error('Error calculating total by type:', error);
      throw error;
    }

    return (data || []).reduce((sum, transaction) => sum + transaction.valor, 0);
  }
}

export default Transacao;
