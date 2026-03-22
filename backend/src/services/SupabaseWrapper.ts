// SupabaseWrapper com consultas reais ao banco (Supabase)
import { supabase } from '../config/supabase';

export const supabaseWrapper = {
  // Users
	async insertUser(userData: any): Promise<any> {
		const { data, error } = await supabase.from('users').insert(userData).select().single();
		if (error) throw error;
		return data;
	},

	async selectUserByFirebaseUid(firebaseUid: string): Promise<any> {
		const { data, error } = await supabase.from('users').select('*').eq('firebase_uid', firebaseUid).maybeSingle();
		if (error) throw error;
		return data;
	},

	async updateUser(userId: string, userData: any): Promise<any> {
		const { data, error } = await (supabase as any).from('users').update(userData as any).eq('id', userId).select().single();
		if (error) throw error;
		return data;
	},

  // Animais
	async insertAnimal(animalData: any): Promise<any> {
		const { data, error } = await supabase.from('animais').insert(animalData).select().single();
		if (error) throw error;
		return data;
	},

	async selectAnimaisByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('animais')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async selectAnimalById(animalId: string): Promise<any | null> {
		const { data, error } = await supabase.from('animais').select('*').eq('id', animalId).maybeSingle();
		if (error) throw error;
		return data;
	},

	async updateAnimal(animalId: string, animalData: any): Promise<any> {
		const { data, error } = await (supabase as any).from('animais').update(animalData as any).eq('id', animalId).select().single();
		if (error) throw error;
		return data;
	},

	async deleteAnimal(animalId: string): Promise<boolean> {
		const { error } = await supabase.from('animais').delete().eq('id', animalId);
		if (error) throw error;
		return true;
	},

  // Manejos
	async insertManejo(manejoData: any): Promise<any> {
		const { data, error } = await supabase.from('manejos').insert(manejoData).select().single();
		if (error) throw error;
		return data;
	},

	async selectManejosByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('manejos')
			.select('*')
			.eq('user_id', userId)
			.order('data_manejo', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async selectManejoById(manejoId: string): Promise<any | null> {
		const { data, error } = await supabase.from('manejos').select('*').eq('id', manejoId).maybeSingle();
		if (error) throw error;
		return data;
	},

	async updateManejo(manejoId: string, manejoData: any): Promise<any> {
		const { data, error } = await (supabase as any).from('manejos').update(manejoData as any).eq('id', manejoId).select().single();
		if (error) throw error;
		return data;
	},

	async deleteManejo(manejoId: string): Promise<boolean> {
		const { error } = await supabase.from('manejos').delete().eq('id', manejoId);
		if (error) throw error;
		return true;
	},

  // Vendas
	async insertVenda(vendaData: any): Promise<any> {
		const { data, error } = await supabase.from('vendas').insert(vendaData).select().single();
		if (error) throw error;
		return data;
	},

	async selectVendasByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('vendas')
			.select('*')
			.eq('user_id', userId)
			.order('data_venda', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async selectVendaById(vendaId: string): Promise<any | null> {
		const { data, error } = await supabase.from('vendas').select('*').eq('id', vendaId).maybeSingle();
		if (error) throw error;
		return data;
	},

	async updateVenda(vendaId: string, vendaData: any): Promise<any> {
		const { data, error } = await (supabase as any).from('vendas').update(vendaData as any).eq('id', vendaId).select().single();
		if (error) throw error;
		return data;
	},

	async deleteVenda(vendaId: string): Promise<boolean> {
		const { error } = await supabase.from('vendas').delete().eq('id', vendaId);
		if (error) throw error;
		return true;
	},

  // Produção
	async insertProducao(producaoData: any): Promise<any> {
		const { data, error } = await supabase.from('producao').insert(producaoData).select().single();
		if (error) throw error;
		return data;
	},

	async selectProducaoByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('producao')
			.select('*')
			.eq('user_id', userId)
			.order('data_producao', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async selectProducaoById(producaoId: string): Promise<any | null> {
		const { data, error } = await supabase.from('producao').select('*').eq('id', producaoId).maybeSingle();
		if (error) throw error;
		return data;
	},

	async updateProducao(producaoId: string, producaoData: any): Promise<any> {
		const { data, error } = await (supabase as any).from('producao').update(producaoData as any).eq('id', producaoId).select().single();
		if (error) throw error;
		return data;
	},

	async deleteProducao(producaoId: string): Promise<boolean> {
		const { error } = await supabase.from('producao').delete().eq('id', producaoId);
		if (error) throw error;
		return true;
	},

  // Metas
	async insertMeta(metaData: any): Promise<any> {
		const { data, error } = await supabase.from('metas').insert(metaData).select().single();
		if (error) throw error;
		return data;
	},

	async selectMetasByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase.from('metas').select('*').eq('user_id', userId).order('created_at', { ascending: false });
		if (error) throw error;
		return data || [];
	},

  // Chat
	async insertChatMessage(messageData: any): Promise<any> {
		const { data, error } = await supabase.from('chat_messages').insert(messageData).select().single();
		if (error) throw error;
		return data;
	},

	async selectChatMessagesByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('chat_messages')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	// Alertas
	async insertAlerta(alertaData: any): Promise<any> {
		const { data, error } = await supabase.from('alertas').insert(alertaData).select().single();
		if (error) throw error;
		return data;
	},

	async selectAlertasByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('alertas')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async selectAlertaById(alertaId: string): Promise<any | null> {
		const { data, error } = await supabase.from('alertas').select('*').eq('id', alertaId).maybeSingle();
		if (error) throw error;
		return data;
	},

	async updateAlerta(alertaId: string, alertaData: any): Promise<any> {
		const { data, error } = await (supabase as any).from('alertas').update(alertaData as any).eq('id', alertaId).select().single();
		if (error) throw error;
		return data;
	},

	// Mercado
	async selectPrecosMercado(): Promise<any[]> {
		const { data, error } = await supabase
			.from('precos_mercado')
			.select('*')
			.order('data_preco', { ascending: false })
			.limit(30);
		if (error) throw error;
		return data || [];
	},

	// Dashboard
	async getEstatisticasDashboard(userId: string): Promise<any> {
		const [animaisRes, vendasRes] = await Promise.all([
			supabase.from('animais').select('id').eq('user_id', userId),
			supabase.from('vendas').select('valor_total').eq('user_id', userId)
		]);
		const total_animais = animaisRes.error ? 0 : (animaisRes.data?.length || 0);
		const receita_mensal = vendasRes.error ? 0 : (vendasRes.data || []).reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0);
		const [alertasRes, metasRes] = await Promise.all([
			supabase.from('alertas').select('id, lido').eq('user_id', userId),
			supabase.from('metas').select('id, concluida').eq('user_id', userId)
		]);

		return {
			total_animais,
			receita_mensal,
			alertas_pendentes: alertasRes.error ? 0 : (alertasRes.data || []).filter((a: any) => !a.lido).length,
			metas_concluidas: metasRes.error ? 0 : (metasRes.data || []).filter((m: any) => m.concluida).length
		};
	}
};
