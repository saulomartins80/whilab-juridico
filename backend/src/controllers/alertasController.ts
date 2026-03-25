// =====================================================
// WHILAB - CONTROLLER DE ALERTAS
// Sistema de notificaÃ§Ãµes e alertas pecuÃ¡rios
// =====================================================

import { Request, Response } from 'express';
import { whilabSupabaseService } from '../services/WhiLabSupabaseService';
import { whilabAIService } from '../services/WhiLabAIService';
import { IAlertaCreate } from '../types/whilab-supabase.types';
import logger from '../utils/logger';

export class AlertasController {

  // =====================================================
  // ALERTAS - CRUD COMPLETO
  // =====================================================

  async createAlerta(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const alertaData: IAlertaCreate = req.body;
      
      // ValidaÃ§Ãµes bÃ¡sicas
      if (!alertaData.tipo_alerta || !alertaData.titulo || !alertaData.mensagem) {
        return res.status(400).json({ 
          error: 'Campos obrigatÃ³rios: tipo_alerta, titulo, mensagem' 
        });
      }

      const alerta = await whilabSupabaseService.createAlerta(userId, alertaData);
      
      logger.info(`Alerta criado: ${alerta.tipo_alerta} para usuÃ¡rio ${userId}`);
      
      res.status(201).json({
        success: true,
        data: alerta,
        message: `ðŸš¨ Alerta de ${alerta.tipo_alerta} criado com sucesso!`
      });

    } catch (error: any) {
      logger.error('Erro ao criar alerta:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getAlertas(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const { tipo, prioridade, status, limit = 50 } = req.query;
      
      const alertas = await whilabSupabaseService.getAlertasByUser(userId);
      
      // Ordenar por prioridade e data
      const alertasOrdenados = alertas
        .sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, Number(limit));

      res.json({
        success: true,
        data: alertasOrdenados,
        total: alertas.length
      });

    } catch (error: any) {
      logger.error('Erro ao buscar alertas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async marcarComoLido(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const { id } = req.params;
      
      const alertaAtualizado = await whilabSupabaseService.updateAlerta(id, {
        lido: true
      });

      res.json({
        success: true,
        data: alertaAtualizado,
        message: 'âœ… Alerta marcado como lido'
      });

    } catch (error: any) {
      logger.error('Erro ao marcar alerta como lido:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // ALERTAS INTELIGENTES
  // =====================================================

  async gerarAlertasInteligentes(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      // Buscar dados para anÃ¡lise
      const animais = await whilabSupabaseService.getAnimaisByUser(userId, {});
      const manejos = await whilabSupabaseService.getManejosByUser(userId, {});
      const producoes = await whilabSupabaseService.getProducaoByUser(userId, {});

      // Gerar alertas com IA (mock por enquanto)
      const alertasIA = [
        {
          tipo: 'sanitario',
          titulo: 'VacinaÃ§Ã£o Pendente',
          mensagem: 'Alguns animais precisam de vacinaÃ§Ã£o',
          prioridade: 'media' as const,
          animalId: animais[0]?.id,
          dataPrevista: new Date().toISOString()
        }
      ];

      // Salvar alertas no banco
      const alertasSalvos = [];
      for (const alertaIA of alertasIA) {
        try {
          const alerta = await whilabSupabaseService.createAlerta(userId, {
            tipo_alerta: alertaIA.tipo,
            titulo: alertaIA.titulo,
            mensagem: alertaIA.mensagem,
            data_alerta: new Date().toISOString(),
            animal_id: alertaIA.animalId
          });
          alertasSalvos.push(alerta);
        } catch (error) {
          logger.error('Erro ao salvar alerta IA:', error);
        }
      }

      res.json({
        success: true,
        data: alertasSalvos,
        message: `ðŸ¤– ${alertasSalvos.length} alertas inteligentes gerados!`
      });

    } catch (error: any) {
      logger.error('Erro ao gerar alertas inteligentes:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // ALERTAS SANITÃRIOS
  // =====================================================

  async getAlertasSanitarios(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const hoje = new Date();
      const proximoMes = new Date();
      proximoMes.setMonth(proximoMes.getMonth() + 1);

      // Buscar manejos com prÃ³ximas aplicaÃ§Ãµes
      const manejos = await whilabSupabaseService.getManejosByUser(userId, {});
      
      const alertasSanitarios = [];

      // Verificar vacinas vencendo
      const vacinasVencendo = manejos.filter(m => {
        if (!m.proxima_aplicacao || m.tipo_manejo !== 'vacinacao') return false;
        const proxima = new Date(m.proxima_aplicacao);
        return proxima >= hoje && proxima <= proximoMes;
      });

      for (const vacina of vacinasVencendo) {
        const diasRestantes = Math.ceil(
          (new Date(vacina.proxima_aplicacao!).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        );

        alertasSanitarios.push({
          tipo: 'vacinacao',
          titulo: `VacinaÃ§Ã£o Pendente`,
          mensagem: `Vacina deve ser aplicada em ${diasRestantes} dias`,
          prioridade: diasRestantes <= 7 ? 'alta' : diasRestantes <= 15 ? 'media' : 'baixa',
          animalId: vacina.animal_id,
          dataPrevista: vacina.proxima_aplicacao,
          categoria: 'sanitario'
        });
      }

      // Verificar vermifugaÃ§Ãµes atrasadas
      const ultimasVermifugacoes = manejos
        .filter(m => m.tipo_manejo === 'vermifugacao')
        .reduce((acc: any, m) => {
          const animalId = m.animal_id;
          if (!acc[animalId] || new Date(m.data_manejo) > new Date(acc[animalId].data_manejo)) {
            acc[animalId] = m;
          }
          return acc;
        }, {});

      Object.values(ultimasVermifugacoes).forEach((ultima: any) => {
        const diasDesde = Math.ceil(
          (hoje.getTime() - new Date(ultima.data_manejo).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasDesde > 90) { // Mais de 3 meses
          alertasSanitarios.push({
            tipo: 'vermifugacao',
            titulo: 'VermifugaÃ§Ã£o Atrasada',
            mensagem: `Animal nÃ£o recebe vermÃ­fugo hÃ¡ ${diasDesde} dias`,
            prioridade: diasDesde > 180 ? 'alta' : 'media',
            animalId: ultima.animal_id,
            categoria: 'sanitario'
          });
        }
      });

      res.json({
        success: true,
        data: alertasSanitarios
      });

    } catch (error: any) {
      logger.error('Erro ao buscar alertas sanitÃ¡rios:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // ALERTAS DE PRODUÃ‡ÃƒO
  // =====================================================

  async getAlertasProducao(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      const alertasProducao = [];
      const hoje = new Date();
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      // Buscar produÃ§Ãµes recentes
      const producoes = await whilabSupabaseService.getProducaoByUser(userId, {
        dataInicio: seteDiasAtras.toISOString()
      });

      // Verificar queda na produÃ§Ã£o
      const producaoLeite = producoes.filter(p => p.tipo === 'leite');
      const leitePorAnimal = producaoLeite.reduce((acc: any, p) => {
        const animalId = p.animal_id;
        if (!acc[animalId]) acc[animalId] = [];
        acc[animalId].push(p);
        return acc;
      }, {});

      Object.entries(leitePorAnimal).forEach(([animalId, producoes]: [string, any]) => {
        if (producoes.length >= 3) {
          const ordenadas = producoes.sort((a: any, b: any) => 
            new Date(a.data_registro).getTime() - new Date(b.data_registro).getTime()
          );
          
          const primeira = ordenadas[0].quantidade || 0;
          const ultima = ordenadas[ordenadas.length - 1].quantidade || 0;
          const reducao = ((primeira - ultima) / primeira) * 100;

          if (reducao > 20) { // Queda de mais de 20%
            alertasProducao.push({
              tipo: 'producao',
              titulo: 'Queda na ProduÃ§Ã£o de Leite',
              mensagem: `ReduÃ§Ã£o de ${reducao.toFixed(1)}% na produÃ§Ã£o nos Ãºltimos dias`,
              prioridade: reducao > 40 ? 'alta' : 'media',
              animalId,
              categoria: 'producao'
            });
          }
        }
      });

      // Verificar animais sem registro de peso recente
      const animais = await whilabSupabaseService.getAnimaisByUser(userId, {});
      const pesagensRecentes = producoes.filter(p => p.tipo === 'peso');
      const animaisComPeso = new Set(pesagensRecentes.map(p => p.animal_id));

      const animaisSemPeso = animais.filter(a => !animaisComPeso.has(a.id));
      
      animaisSemPeso.forEach(animal => {
        const idadeEmMeses = animal.data_nascimento ? 
          Math.floor((hoje.getTime() - new Date(animal.data_nascimento).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;

        if (idadeEmMeses > 6) { // Animais com mais de 6 meses
          alertasProducao.push({
            tipo: 'pesagem',
            titulo: 'Pesagem Pendente',
            mensagem: `Animal nÃ£o tem registro de peso nos Ãºltimos 7 dias`,
            prioridade: 'baixa',
            animalId: animal.id,
            categoria: 'producao'
          });
        }
      });

      res.json({
        success: true,
        data: alertasProducao
      });

    } catch (error: any) {
      logger.error('Erro ao buscar alertas de produÃ§Ã£o:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // DASHBOARD DE ALERTAS
  // =====================================================

  async getDashboardAlertas(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      // Buscar todos os alertas
      const alertas = await whilabSupabaseService.getAlertasByUser(userId);
      
      // Contar por status
      const porStatus = alertas.reduce((acc: any, a) => {
        const status = a.lido ? 'lido' : 'nao_lido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Contar por prioridade (mock)
      const porPrioridade = { alta: 0, media: 0, baixa: 0 };

      // Contar por tipo
      const porTipo = alertas.reduce((acc: any, a) => {
        acc[a.tipo_alerta] = (acc[a.tipo_alerta] || 0) + 1;
        return acc;
      }, {});

      // Alertas crÃ­ticos (nÃ£o lidos)
      const alertasCriticos = alertas.filter(a => !a.lido);

      // Alertas recentes (Ãºltimas 24h)
      const ontemAgora = new Date();
      ontemAgora.setDate(ontemAgora.getDate() - 1);
      
      const alertasRecentes = alertas.filter(a => 
        new Date(a.created_at) >= ontemAgora
      );

      res.json({
        success: true,
        data: {
          resumo: {
            total: alertas.length,
            naoLidos: porStatus.nao_lido || 0,
            criticos: alertasCriticos.length,
            recentes: alertasRecentes.length
          },
          distribuicao: {
            porStatus,
            porPrioridade,
            porTipo
          },
          alertasCriticos: alertasCriticos.slice(0, 10),
          alertasRecentes: alertasRecentes.slice(0, 10)
        }
      });

    } catch (error: any) {
      logger.error('Erro ao buscar dashboard de alertas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // CONFIGURAÃ‡Ã•ES DE NOTIFICAÃ‡ÃƒO
  // =====================================================

  async getConfiguracoes(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'UsuÃ¡rio nÃ£o autenticado' });
      }

      // ConfiguraÃ§Ãµes padrÃ£o (em produÃ§Ã£o, viria do banco)
      const configuracoes = {
        notificacoesPush: true,
        notificacoesSMS: false,
        notificacoesEmail: true,
        tiposAtivos: {
          sanitario: true,
          producao: true,
          reproducao: true,
          financeiro: true,
          geral: true
        },
        prioridadeMinima: 'baixa',
        horarioNotificacao: {
          inicio: '07:00',
          fim: '22:00'
        },
        frequenciaResumo: 'diario'
      };

      res.json({
        success: true,
        data: configuracoes
      });

    } catch (error: any) {
      logger.error('Erro ao buscar configuraÃ§Ãµes:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

export const alertasController = new AlertasController();

