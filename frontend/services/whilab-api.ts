// services/whilab-api.ts - WhiLab API Service
import { Animal, Manejo, Producao, Venda } from '../types/whilab.types';
import logger from '../utils/logger';

import api from './api';

// Usa o cliente API unificado (com token Supabase e redaction)

// WhiLab API Endpoints
export const whilabAPI = {
  // Animais (Rebanho)
  animals: {
    getAll: async (): Promise<Animal[]> => {
      try {
        const response = await api.get('/api/animals');
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao buscar animais:', error);
        // Mock data for development
        return [
          {
            id: '1',
            brinco: 'BV001',
            raca: 'NELORE',
            sexo: 'macho',
            data_nascimento: '2023-03-15',
            peso_atual: 485,
            status: 'ativo',
            lote: 'LOTE-A',
            pasto: 'PASTO-01',
            categoria: 'boi',
            valor_compra: 2500,
            custo_acumulado: 850,
            observacoes: 'Animal em excelente estado',
            created_at: '2023-03-15T00:00:00Z',
            updated_at: '2023-06-15T00:00:00Z'
          }
        ];
      }
    },
    
    create: async (animal: Omit<Animal, 'id'>): Promise<Animal> => {
      try {
        const response = await api.post('/api/animals', animal);
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao criar animal:', error);
        throw error;
      }
    },
    
    update: async (id: string, animal: Partial<Animal>): Promise<Animal> => {
      try {
        const response = await api.put(`/api/animals/${id}`, animal);
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao atualizar animal:', error);
        throw error;
      }
    },
    
    delete: async (id: string): Promise<void> => {
      try {
        await api.delete(`/api/animals/${id}`);
      } catch (error) {
        logger.error('Erro ao deletar animal:', error);
        throw error;
      }
    }
  },

  // Manejo
  manejo: {
    getAll: async (): Promise<Manejo[]> => {
      try {
        const response = await api.get('/api/manejo');
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao buscar manejos:', error);
        // Mock data for development
        return [
          {
            id: '1',
            user_id: 'user_1',
            animal_id: '1',
            tipo_manejo: 'vacinacao',
            data_manejo: '2024-12-15',
            produto_usado: 'Vacina Aftosa',
            dosagem: '5ml por animal',
            custo: 450.00,
            observacoes: 'Aplicação realizada conforme protocolo',
            proxima_aplicacao: '2025-09-08',
            created_at: '2024-12-01T00:00:00Z',
            updated_at: '2024-12-01T00:00:00Z',
            // compat UI
            animais: ['BV001', 'BV002'],
            data: new Date('2024-12-15'),
            responsavel: 'Dr. João Silva',
            status: 'REALIZADO'
          }
        ];
      }
    },
    
    create: async (manejo: Omit<Manejo, 'id'>): Promise<Manejo> => {
      try {
        const response = await api.post('/api/manejo', manejo);
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao criar manejo:', error);
        throw error;
      }
    }
  },

  // Produção
  producao: {
    getAll: async (): Promise<Producao[]> => {
      try {
        const response = await api.get('/api/producao');
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao buscar produções:', error);
        // Mock data for development
        return [
          {
            id: '1',
            tipo: 'ENGORDA',
            animal: 'BV001',
            data: new Date('2024-09-01'),
            peso: 485,
            ganhoMedio: 1.15,
            custoProducao: 850,
            receita: 2400,
            margemLucro: 65,
            observacoes: 'Excelente ganho de peso'
          }
        ];
      }
    },
    
    create: async (producao: Omit<Producao, 'id'>): Promise<Producao> => {
      try {
        const response = await api.post('/api/producao', producao);
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao criar produção:', error);
        throw error;
      }
    }
  },

  // Vendas
  vendas: {
    getAll: async (): Promise<Venda[]> => {
      try {
        const response = await api.get('/api/vendas');
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao buscar vendas:', error);
        // Mock data for development
        return [
          {
            id: '1',
            animais: ['BV001', 'BV002', 'BV003'],
            comprador: 'Frigorífico Central',
            tipoVenda: 'FRIGORIFICO',
            pesoTotal: 1650,
            precoArroba: 315.80,
            valorTotal: 347370.00,
            dataVenda: new Date('2024-12-10'),
            dataEntrega: new Date('2024-12-15'),
            impostos: {
              funrural: 6947.40,
              icms: 41684.40,
              outros: 3473.70
            },
            lucroLiquido: 295264.50,
            observacoes: 'Animal pronto para abate',
            status: 'ENTREGUE'
          }
        ];
      }
    },
    
    create: async (venda: Omit<Venda, 'id'>): Promise<Venda> => {
      try {
        const response = await api.post('/api/vendas', venda);
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao criar venda:', error);
        throw error;
      }
    }
  },

  // Dashboard Analytics
  dashboard: {
    getKPIs: async () => {
      try {
        const response = await api.get('/api/dashboard/kpis');
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao buscar KPIs:', error);
        // Mock data for development
        return {
          totalAnimais: 1247,
          receitaMensal: 1200000,
          gmdMedio: 1.12,
          precoArroba: 315.80,
          alertasAtivos: 3
        };
      }
    },
    
    getChartData: async (type: string, period: string) => {
      try {
        const response = await api.get(`/api/dashboard/charts/${type}`, { params: { period } });
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao buscar dados do gráfico:', error);
        return [];
      }
    }
  },

  // IA FINN Bovino
  ia: {
    chat: async (message: string, context?: Record<string, unknown>) => {
      try {
        const response = await api.post('/api/ia/chat', { message, context });
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro no chat com IA:', error);
        // Mock response for development
        return {
          response: 'Olá! Sou o FINN Bovino, sua IA especializada em pecuária. Como posso ajudar você hoje?',
          suggestions: [
            'Quantos animais tenho no rebanho?',
            'Qual o preço da arroba hoje?',
            'Como está a performance do meu rebanho?'
          ]
        };
      }
    },
    
    analyze: async (data: Record<string, unknown>) => {
      try {
        const response = await api.post('/api/ia/analyze', data);
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro na análise da IA:', error);
        throw error;
      }
    }
  },

  // Relatórios
  reports: {
    generate: async (type: string, filters: Record<string, unknown>) => {
      try {
        const response = await api.post('/api/reports/generate', { type, filters });
        return response.data?.data || response.data;
      } catch (error) {
        logger.error('Erro ao gerar relatório:', error);
        throw error;
      }
    },
    
    export: async (reportId: string, format: 'pdf' | 'excel') => {
      try {
        const response = await api.get(`/api/reports/${reportId}/export?format=${format}`, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        logger.error('Erro ao exportar relatório:', error);
        throw error;
      }
    }
  }
};

export default whilabAPI;
