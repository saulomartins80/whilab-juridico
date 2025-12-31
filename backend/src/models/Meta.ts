import supabase from '../config/supabase';

export interface IMeta {
  id?: string;
  user_id: string;
  nome_da_meta: string;
  descricao: string;
  valor_total: number;
  valor_atual: number;
  data_conclusao: string;
  categoria?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  concluida: boolean;
  created_at?: string;
  updated_at?: string;
}

export class Meta {
  static async create(metaData: Omit<IMeta, 'id' | 'created_at' | 'updated_at' | 'concluida'>): Promise<IMeta> {
    const { data, error } = await supabase
      .from('metas')
      .insert([{
        ...metaData,
        valor_atual: metaData.valor_atual || 0,
        prioridade: metaData.prioridade || 'media',
        concluida: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating meta:', error);
      throw error;
    }

    return data;
  }

  static async findByUserId(userId: string): Promise<IMeta[]> {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching metas:', error);
      throw error;
    }

    // Calcular se está concluída baseado no progresso
    return (data || []).map(meta => ({
      ...meta,
      concluida: meta.valor_atual >= meta.valor_total || meta.concluida
    }));
  }

  static async findById(id: string): Promise<IMeta | null> {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching meta:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, updateData: Partial<Omit<IMeta, 'id' | 'created_at' | 'updated_at'>>): Promise<IMeta> {
    // Se está atualizando valor_atual, verificar se deve marcar como concluída
    if (updateData.valor_atual !== undefined) {
      const meta = await this.findById(id);
      if (meta && updateData.valor_atual >= meta.valor_total) {
        updateData.concluida = true;
      }
    }

    const { data, error } = await supabase
      .from('metas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating meta:', error);
      throw error;
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('metas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meta:', error);
      throw error;
    }
  }

  static async getProgress(id: string): Promise<{ progresso: number; concluida: boolean }> {
    const meta = await this.findById(id);
    if (!meta) {
      throw new Error('Meta não encontrada');
    }

    const progresso = meta.valor_total > 0 ? (meta.valor_atual / meta.valor_total) * 100 : 0;
    const concluida = progresso >= 100;

    return { progresso, concluida };
  }

  static async addValue(id: string, valor: number): Promise<IMeta> {
    const meta = await this.findById(id);
    if (!meta) {
      throw new Error('Meta não encontrada');
    }

    const novoValorAtual = meta.valor_atual + valor;
    return this.update(id, { valor_atual: novoValorAtual });
  }

  static async getByCategory(userId: string, categoria: string): Promise<IMeta[]> {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('user_id', userId)
      .eq('categoria', categoria)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching metas by category:', error);
      throw error;
    }

    return data || [];
  }

  static async getCompleted(userId: string): Promise<IMeta[]> {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('user_id', userId)
      .eq('concluida', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed metas:', error);
      throw error;
    }

    return data || [];
  }

  static async getPending(userId: string): Promise<IMeta[]> {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('user_id', userId)
      .eq('concluida', false)
      .order('data_conclusao', { ascending: true });

    if (error) {
      console.error('Error fetching pending metas:', error);
      throw error;
    }

    return data || [];
  }
}

export default Meta;
