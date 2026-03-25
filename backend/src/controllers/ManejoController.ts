// =====================================================
// WHILAB - CONTROLLER DE MANEJO
// GestÃ£o sanitÃ¡ria e produtiva com Supabase
// =====================================================

import { Request, Response } from 'express';
import { whilabSupabaseService } from '../services/WhiLabSupabaseService';
import { IManejoCreate } from '../types/whilab-supabase.types';
import logger from '../utils/logger';

export class ManejoController {

  // =====================================================
  // MANEJOS - CRUD COMPLETO
  // =====================================================

  async createManejo(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const manejoData: IManejoCreate = req.body;
      
      // ValidaÃ§Ãµes bÃ¡sicas
      if (!manejoData.animal_id || !manejoData.tipo_manejo || !manejoData.data_manejo) {
        return res.status(400).json({ 
          error: 'Campos obrigatÃ³rios: animal_id, tipo_manejo, data_manejo' 
        });
      }

      const manejo = await whilabSupabaseService.createManejo(userId, manejoData);
      
      logger.info(`Manejo criado: ${manejo.tipo_manejo} para usuÃ¡rio ${userId}`);
      
      res.status(201).json({
        success: true,
        data: manejo,
        message: `ðŸ’‰ Manejo de ${manejo.tipo_manejo} registrado com sucesso!`
      });

    } catch (error: any) {
      logger.error('Erro ao criar manejo:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getManejos(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const { animalId, tipoManejo, dataInicio, dataFim } = req.query;
      
      const filters = {
        animalId: animalId as string,
        tipoManejo: tipoManejo as string,
        dataInicio: dataInicio as string,
        dataFim: dataFim as string
      };

      const manejos = await whilabSupabaseService.getManejosByUser(userId, filters);
      
      res.json({
        success: true,
        data: manejos,
        total: manejos.length
      });

    } catch (error: any) {
      logger.error('Erro ao buscar manejos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // CALENDÃRIO SANITÃRIO
  // =====================================================

  async getCalendarioSanitario(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const { mes, ano } = req.query;
      const currentDate = new Date();
      const targetMonth = mes ? Number(mes) : currentDate.getMonth() + 1;
      const targetYear = ano ? Number(ano) : currentDate.getFullYear();

      // Buscar manejos do mÃªs
      const dataInicio = new Date(targetYear, targetMonth - 1, 1).toISOString();
      const dataFim = new Date(targetYear, targetMonth, 0).toISOString();

      const manejos = await whilabSupabaseService.getManejosByUser(userId, {
        dataInicio,
        dataFim
      });

      // Buscar prÃ³ximas aplicaÃ§Ãµes
      const proximoMes = new Date();
      proximoMes.setMonth(proximoMes.getMonth() + 1);

      const proximasAplicacoes = await whilabSupabaseService.getManejosByUser(userId, {
        tipoManejo: 'vacinacao'
      });

      const vacinasVencendo = proximasAplicacoes.filter(m => {
        if (!m.proxima_aplicacao) return false;
        const proxima = new Date(m.proxima_aplicacao);
        return proxima >= currentDate && proxima <= proximoMes;
      });

      res.json({
        success: true,
        data: {
          manejos,
          proximasVacinacoes: vacinasVencendo,
          resumo: {
            totalManejos: manejos.length,
            vacinacoes: manejos.filter(m => m.tipo_manejo === 'vacinacao').length,
            vermifugacoes: manejos.filter(m => m.tipo_manejo === 'vermifugacao').length,
            pesagens: manejos.filter(m => m.tipo_manejo === 'pesagem').length,
            tratamentos: manejos.filter(m => m.tipo_manejo === 'tratamento').length
          }
        }
      });

    } catch (error: any) {
      logger.error('Erro ao buscar calendÃ¡rio sanitÃ¡rio:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // PROTOCOLOS DE VACINAÃ‡ÃƒO
  // =====================================================

  async getProtocolosVacinacao(req: Request, res: Response) {
    try {
      // Protocolos padrÃ£o de vacinaÃ§Ã£o bovina
      const protocolos = {
        bezerros: [
          {
            idade: '2-4 meses',
            vacinas: ['Clostridioses', 'Pneumonia'],
            observacoes: 'Primeira vacinaÃ§Ã£o'
          },
          {
            idade: '4-6 meses',
            vacinas: ['Clostridioses (reforÃ§o)', 'Raiva'],
            observacoes: 'ReforÃ§o obrigatÃ³rio'
          }
        ],
        novilhos: [
          {
            idade: '12-15 meses',
            vacinas: ['Febre Aftosa', 'Brucelose (fÃªmeas)'],
            observacoes: 'VacinaÃ§Ã£o anual'
          }
        ],
        adultos: [
          {
            periodo: 'Maio/Novembro',
            vacinas: ['Febre Aftosa'],
            observacoes: 'Campanha oficial'
          },
          {
            periodo: 'Anual',
            vacinas: ['Clostridioses', 'Raiva'],
            observacoes: 'Manter imunidade'
          }
        ]
      };

      res.json({
        success: true,
        data: protocolos,
        disclaimer: 'âš ï¸ Consulte sempre um veterinÃ¡rio para protocolos especÃ­ficos da sua regiÃ£o'
      });

    } catch (error: any) {
      logger.error('Erro ao buscar protocolos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // CUSTOS DE MANEJO
  // =====================================================

  async getCustosManejo(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const { dataInicio, dataFim, tipoManejo } = req.query;
      
      const filters: any = {};
      if (dataInicio) filters.dataInicio = dataInicio as string;
      if (dataFim) filters.dataFim = dataFim as string;
      if (tipoManejo) filters.tipoManejo = tipoManejo as string;

      const manejos = await whilabSupabaseService.getManejosByUser(userId, filters);
      
      // Calcular custos por tipo
      const custosPorTipo = manejos.reduce((acc: any, manejo) => {
        const tipo = manejo.tipo_manejo;
        const custo = manejo.custo || 0;
        
        if (!acc[tipo]) {
          acc[tipo] = { total: 0, count: 0, media: 0 };
        }
        
        acc[tipo].total += custo;
        acc[tipo].count += 1;
        acc[tipo].media = acc[tipo].total / acc[tipo].count;
        
        return acc;
      }, {});

      const custoTotal = manejos.reduce((sum, m) => sum + (m.custo || 0), 0);
      
      res.json({
        success: true,
        data: {
          custoTotal,
          custosPorTipo,
          totalManejos: manejos.length,
          custoMedio: manejos.length > 0 ? custoTotal / manejos.length : 0
        }
      });

    } catch (error: any) {
      logger.error('Erro ao calcular custos de manejo:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

export const manejoController = new ManejoController();

