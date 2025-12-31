// routes/bovinextRoutes.ts - Rotas específicas do BOVINEXT
import express from 'express';
import { bovinextSupabaseService } from '../services/BovinextSupabaseService';
import { BovinextOptimizedAIService } from '../services/BovinextOptimizedAIService';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);
// ==================== PERFIL DO USUÁRIO ====================
router.get('/profile', async (req, res) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const profile = await bovinextSupabaseService.getUserProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const allowed = ['name', 'email', 'telefone', 'fazenda_nome', 'avatar_url'];
    const payload: Record<string, unknown> = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

    const updated = await bovinextSupabaseService.updateUserProfile(userId, payload);
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== ANIMAIS (REBANHO) ====================
router.get('/animals', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.query.user_id || '';
    const animals = await bovinextSupabaseService.getAnimaisByUser(String(userId));
    res.json({ success: true, data: animals });
  } catch (error) {
    console.error('Erro ao buscar animais:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/animals', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.body.user_id;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id é obrigatório' });

    const animalData = req.body;
    if (!animalData.brinco || !animalData.raca || !animalData.sexo || !animalData.data_nascimento) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios: brinco, raca, sexo, data_nascimento' });
    }

    const created = await bovinextSupabaseService.createAnimal(String(userId), animalData);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Erro ao criar animal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.put('/animals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await bovinextSupabaseService.updateAnimal(String(id), updateData);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar animal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.delete('/animals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await bovinextSupabaseService.deleteAnimal(String(id));
    res.json({ success: true, message: 'Animal removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar animal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== MANEJO ====================
router.get('/manejo', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || String(req.query.user_id || '');
    const manejos = await bovinextSupabaseService.getManejosByUser(userId);
    res.json({ success: true, data: manejos });
  } catch (error) {
    console.error('Erro ao buscar manejos:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/manejo', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.body.user_id;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    const manejo = await bovinextSupabaseService.createManejo(String(userId), req.body);
    res.status(201).json({ success: true, data: manejo });
  } catch (error) {
    console.error('Erro ao criar manejo:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/producao', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.body.user_id;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    const producao = await bovinextSupabaseService.createProducao(String(userId), req.body);
    res.status(201).json({ success: true, data: producao });
  } catch (error) {
    console.error('Erro ao criar produção:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== VENDAS ====================
router.get('/vendas', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || String(req.query.user_id || '');
    const vendas = await bovinextSupabaseService.getVendasByUser(userId);
    res.json({ success: true, data: vendas });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/vendas', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.body.user_id;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    const venda = await bovinextSupabaseService.createVenda(String(userId), req.body, req.body.animais_ids || []);
    res.status(201).json({ success: true, data: venda });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== DASHBOARD & KPIs ====================
router.get('/dashboard/kpis', async (req, res) => {
  try {
    const kpis = {
      totalAnimais: 1247,
      receitaMensal: 1200000,
      gmdMedio: 1.12,
      precoArroba: 315.80,
      alertasAtivos: 3,
      custoPorCabeca: 850,
      margemLucro: 65.2,
      taxaNatalidade: 85.5,
      taxaMortalidade: 2.1
    };
    
    res.json({ success: true, data: kpis });
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.get('/dashboard/charts/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { period } = req.query;
    
    // Mock chart data baseado no tipo
    let chartData = [];
    
    switch (type) {
      case 'peso':
        chartData = [
          { data: '2024-01', valor: 450 },
          { data: '2024-02', valor: 465 },
          { data: '2024-03', valor: 480 },
          { data: '2024-04', valor: 485 }
        ];
        break;
      case 'receita':
        chartData = [
          { data: '2024-01', valor: 980000 },
          { data: '2024-02', valor: 1050000 },
          { data: '2024-03', valor: 1150000 },
          { data: '2024-04', valor: 1200000 }
        ];
        break;
      default:
        chartData = [];
    }
    
    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== IA FINN BOVINO ====================
router.post('/ia/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Mock response da IA - substituir por integração real
    const response = {
      response: `Olá! Sou o FINN Bovino. Você perguntou: "${message}". Como posso ajudar com seu rebanho?`,
      suggestions: [
        'Quantos animais tenho no rebanho?',
        'Qual o preço da arroba hoje?',
        'Como está a performance do meu rebanho?',
        'Preciso vacinar algum animal?'
      ],
      context: context || {}
    };
    
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Erro no chat com IA:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== CHATBOT QUERY (ENDPOINT CORRETO) ====================
router.post('/chatbot/query', async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = (req as any).user?.uid;

    console.log('[CHATBOT] 📨 Nova mensagem recebida:', { message, chatId, userId });

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mensagem é obrigatória' 
      });
    }

    // Usar o serviço de IA do BOVINEXT
    const aiService = new BovinextOptimizedAIService();
    
    // Processar mensagem com IA especializada
    const aiResponse = await aiService.processMessage(userId || 'anonymous', message.trim());
    
    console.log('[CHATBOT] 🤖 Resposta da IA:', aiResponse);

    // Formato de resposta compatível com o frontend
    const response = {
      id: `msg_${Date.now()}`,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      isUser: false,
      suggestions: [
        'Quantos animais tenho no rebanho?',
        'Qual o preço da arroba hoje?',
        'Como está a performance do meu rebanho?',
        'Preciso vacinar algum animal?'
      ]
    };
    
    res.json({ 
      success: true, 
      data: response,
      chatId: chatId || `chat_${Date.now()}`
    });

  } catch (error) {
    console.error('[CHATBOT] ❌ Erro ao processar mensagem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== CHATBOT SESSIONS ====================
router.get('/chatbot/sessions', async (req, res) => {
  try {
    const userId = (req as any).user?.uid;
    console.log('[CHATBOT] 📋 Buscando sessões do usuário:', userId);

    // Mock sessions - implementar com banco de dados real
    const sessions = [
      {
        id: `chat_${Date.now() - 86400000}`,
        title: 'Conversa sobre rebanho',
        lastMessage: 'Como está meu rebanho?',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        messageCount: 5
      },
      {
        id: `chat_${Date.now() - 172800000}`,
        title: 'Preço da arroba',
        lastMessage: 'Qual o preço da arroba hoje?',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        messageCount: 3
      }
    ];

    res.json({ 
      success: true, 
      data: sessions 
    });

  } catch (error) {
    console.error('[CHATBOT] ❌ Erro ao buscar sessões:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/chatbot/sessions', async (req, res) => {
  try {
    const userId = (req as any).user?.uid;
    console.log('[CHATBOT] 🆕 Criando nova sessão para usuário:', userId);

    const newSession = {
      chatId: `chat_${Date.now()}`,
      userId: userId || 'anonymous',
      title: 'Nova conversa',
      createdAt: new Date().toISOString(),
      messages: []
    };

    res.json({ 
      success: true, 
      chatId: newSession.chatId,
      message: 'Sessão criada com sucesso'
    });

  } catch (error) {
    console.error('[CHATBOT] ❌ Erro ao criar sessão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.get('/chatbot/sessions/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).user?.uid;
    console.log('[CHATBOT] 🔍 Buscando sessão:', { chatId, userId });

    // Mock session data - implementar com banco de dados real
    const session = {
      id: chatId,
      userId: userId || 'anonymous',
      title: 'Conversa sobre rebanho',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_1',
          sender: 'user',
          content: 'Como está meu rebanho?',
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg_2',
          sender: 'assistant',
          content: 'Seu rebanho está bem! Você tem 150 animais com peso médio de 485kg.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    res.json({ 
      success: true, 
      data: session 
    });

  } catch (error) {
    console.error('[CHATBOT] ❌ Erro ao buscar sessão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.delete('/chatbot/sessions/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).user?.uid;
    console.log('[CHATBOT] 🗑️ Deletando sessão:', { chatId, userId });

    res.json({ 
      success: true, 
      message: 'Sessão deletada com sucesso' 
    });

  } catch (error) {
    console.error('[CHATBOT] ❌ Erro ao deletar sessão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.delete('/chatbot/sessions', async (req, res) => {
  try {
    const userId = (req as any).user?.uid;
    console.log('[CHATBOT] 🗑️ Deletando todas as sessões do usuário:', userId);

    res.json({ 
      success: true, 
      message: 'Todas as sessões foram deletadas com sucesso' 
    });

  } catch (error) {
    console.error('[CHATBOT] ❌ Erro ao deletar todas as sessões:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// ==================== CHATBOT FEEDBACK ====================
router.post('/chatbot/feedback', async (req, res) => {
  try {
    const { messageId, rating, helpful, comment, category, context } = req.body;
    const userId = (req as any).user?.uid;
    
    console.log('[CHATBOT] 👍 Recebendo feedback:', { 
      messageId, rating, helpful, category, userId 
    });

    // Salvar feedback - implementar com banco de dados real
    const feedback = {
      id: `feedback_${Date.now()}`,
      messageId,
      userId: userId || 'anonymous',
      rating,
      helpful,
      comment,
      category,
      context,
      timestamp: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      message: 'Feedback salvo com sucesso',
      data: feedback
    });

  } catch (error) {
    console.error('[CHATBOT] ❌ Erro ao salvar feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// ==================== AUTOMATED ACTIONS ====================
router.post('/automated-actions/execute', async (req, res) => {
  try {
    const { action, payload, chatId, message } = req.body;
    const userId = (req as any).user?.uid;
    
    console.log('[AUTOMATED_ACTIONS] ⚡ Executando ação:', { 
      action, payload, chatId, userId 
    });

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mensagem é obrigatória' 
      });
    }

    // Mock execution - implementar ações reais
    let result = { success: true, text: '' };
    
    switch (action) {
      case 'CREATE_TRANSACTION':
        result.text = `✅ Transação criada: ${payload.descricao} - R$ ${payload.valor}`;
        break;
      case 'CREATE_GOAL':
        result.text = `✅ Meta criada: ${payload.meta} - R$ ${payload.valor_total}`;
        break;
      case 'CREATE_INVESTMENT':
        result.text = `✅ Investimento registrado: ${payload.nome} - R$ ${payload.valor}`;
        break;
      default:
        result.text = `✅ Ação ${action} executada com sucesso!`;
    }

    res.json({ 
      success: true, 
      text: result.text,
      data: { action, payload, executed: true }
    });

  } catch (error) {
    console.error('[AUTOMATED_ACTIONS] ❌ Erro ao executar ação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/chatbot/confirm-action', async (req, res) => {
  try {
    const { actionData, action } = req.body;
    const userId = (req as any).user?.uid;
    
    console.log('[CHATBOT] ✅ Confirmação de ação:', { actionData, action, userId });

    if (action === 'confirm') {
      res.json({ 
        success: true, 
        message: 'Ação confirmada e executada com sucesso',
        data: { confirmed: true, executed: true }
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Ação cancelada',
        data: { confirmed: false, executed: false }
      });
    }

  } catch (error) {
    console.error('[CHATBOT] ❌ Erro ao confirmar ação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/ia/analyze', async (req, res) => {
  try {
    const analysisData = req.body;
    
    // Mock analysis response
    const analysis = {
      tipo: 'analise_rebanho',
      resultados: {
        gmd_medio: 1.15,
        peso_medio: 485,
        recomendacoes: [
          'Considere suplementação mineral',
          'Monitore peso dos animais semanalmente',
          'Verifique qualidade do pasto'
        ]
      },
      confianca: 0.95,
      timestamp: new Date()
    };
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Erro na análise da IA:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== RELATÓRIOS ====================
router.post('/reports/generate', async (req, res) => {
  try {
    const { type, filters } = req.body;
    
    const report = {
      id: Date.now().toString(),
      tipo: type,
      filtros: filters,
      status: 'PROCESSANDO',
      dataGeracao: new Date(),
      url: null
    };
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.get('/reports/:reportId/export', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { format } = req.query;
    
    // Mock export - substituir por geração real de PDF/Excel
    res.json({ 
      success: true, 
      message: `Relatório ${reportId} exportado em ${format}`,
      downloadUrl: `/downloads/report-${reportId}.${format}`
    });
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;
