// routes/whilabRoutes.ts - Rotas especÃ­ficas do WHILAB
import express from 'express';
import { whilabSupabaseService } from '../services/WhiLabSupabaseService';
import { supabaseService } from '../services/SupabaseService';
import { WhiLabOptimizedAIService } from '../services/WhiLabOptimizedAIService';
import { ChatHistoryService } from '../services/chatHistoryService';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// Middleware de autenticaÃ§Ã£o para todas as rotas
router.use(authenticateToken);
// ==================== PERFIL DO USUÃRIO ====================
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ success: false, message: 'NÃ£o autenticado' });

    const profile = await whilabSupabaseService.getUserProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ success: false, message: 'NÃ£o autenticado' });

    const allowed = ['name', 'email', 'telefone', 'fazenda_nome', 'avatar_url'];
    const payload: Record<string, unknown> = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

    const updated = await whilabSupabaseService.updateUserProfile(userId, payload);
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== ANIMAIS (REBANHO) ====================
router.get('/animals', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'NÃ£o autenticado' });
    }
    const animals = await supabaseService.getAnimais({ userId: String(userId) });
    res.json({ success: true, data: animals });
  } catch (error) {
    console.error('Erro ao buscar animais:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/animals', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id Ã© obrigatÃ³rio' });

    const animalData = req.body;
    if (!animalData.brinco || !animalData.raca || !animalData.sexo || !animalData.data_nascimento) {
      return res.status(400).json({ success: false, message: 'Campos obrigatÃ³rios: brinco, raca, sexo, data_nascimento' });
    }

    const created = await supabaseService.createAnimal({
      ...animalData,
      user_id: String(userId)
    });
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
    const updated = await supabaseService.updateAnimal(String(id), updateData);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar animal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.delete('/animals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteAnimal(String(id));
    res.json({ success: true, message: 'Animal removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar animal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== MANEJO ====================
router.get('/manejo', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'NÃ£o autenticado' });
    }
    const manejos = await supabaseService.getManejos({ userId });
    res.json({ success: true, data: manejos });
  } catch (error) {
    console.error('Erro ao buscar manejos:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/manejo', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id Ã© obrigatÃ³rio' });
    const manejo = await supabaseService.createManejo({
      ...req.body,
      user_id: String(userId)
    });
    res.status(201).json({ success: true, data: manejo });
  } catch (error) {
    console.error('Erro ao criar manejo:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.put('/manejo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await supabaseService.updateManejo(String(id), req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar manejo:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.delete('/manejo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteManejo(String(id));
    res.json({ success: true, message: 'Manejo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar manejo:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== PRODUÃ‡ÃƒO ====================
router.get('/producao', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ success: false, message: 'NÃ£o autenticado' });
    const producao = await supabaseService.getProducoes({ userId });
    res.json({ success: true, data: producao });
  } catch (error) {
    console.error('Erro ao buscar produÃ§Ã£o:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/producao', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id Ã© obrigatÃ³rio' });
    const producao = await supabaseService.createProducao({
      ...req.body,
      user_id: String(userId)
    });
    res.status(201).json({ success: true, data: producao });
  } catch (error) {
    console.error('Erro ao criar produÃ§Ã£o:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.put('/producao/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await supabaseService.updateProducao(String(id), req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar produÃ§Ã£o:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.delete('/producao/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteProducao(String(id));
    res.json({ success: true, message: 'Registro de produÃ§Ã£o removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produÃ§Ã£o:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== VENDAS ====================
router.get('/vendas', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'NÃ£o autenticado' });
    }
    const vendas = await supabaseService.getVendas({ userId });
    res.json({ success: true, data: vendas });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/vendas', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id Ã© obrigatÃ³rio' });
    const venda = await supabaseService.createVenda({
      ...req.body,
      user_id: String(userId)
    });
    res.status(201).json({ success: true, data: venda });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.put('/vendas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await supabaseService.updateVenda(String(id), req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.delete('/vendas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteVenda(String(id));
    res.json({ success: true, message: 'Venda removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== DASHBOARD & KPIs ====================
router.get('/dashboard/kpis', async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'NÃ£o autenticado' });
    }

    const kpis = await supabaseService.getDashboardKPIs(userId);

    res.json({ success: true, data: kpis });
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.get('/dashboard/charts/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'NÃ£o autenticado' });
    }

    let chartData: Array<{ data: string; valor: number }> = [];
    const vendas = await supabaseService.getVendas({ userId }).catch(() => []);
    const producoes = await supabaseService.getProducoes({ userId }).catch(() => []);
    
    switch (type) {
      case 'peso':
        chartData = producoes.slice(0, 12).map((item: any) => ({
          data: String(item.data_producao || item.data || '').slice(0, 7),
          valor: Number(item.peso || item.valor || 0)
        }));
        break;
      case 'receita':
        chartData = vendas.slice(0, 12).map((item: any) => ({
          data: String(item.data_venda || '').slice(0, 7),
          valor: Number(item.valor_total || 0)
        }));
        break;
      default:
        chartData = [];
    }
    
    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Erro ao buscar dados do grÃ¡fico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== IA FINN BOVINO ====================
router.post('/ia/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user?.uid || 'anonymous';
    const ai = new WhiLabOptimizedAIService();
    const response = {
      response: await ai.processMessage(userId, String(message || '')),
      suggestions: [
        'Quantos animais tenho no rebanho?',
        'Qual o preÃ§o da arroba hoje?',
        'Como estÃ¡ a performance do meu rebanho?',
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
    const userId = req.user?.uid;

    console.log('[CHATBOT] ðŸ“¨ Nova mensagem recebida:', { message, chatId, userId });

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mensagem Ã© obrigatÃ³ria' 
      });
    }

    // Usar o serviÃ§o de IA do WHILAB
    const aiService = new WhiLabOptimizedAIService();
    
    // Processar mensagem com IA especializada
    const aiResponse = await aiService.processMessage(userId || 'anonymous', message.trim());
    
    console.log('[CHATBOT] ðŸ¤– Resposta da IA:', aiResponse);

    // Formato de resposta compatÃ­vel com o frontend
    const response = {
      id: `msg_${Date.now()}`,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      isUser: false,
      suggestions: [
        'Quantos animais tenho no rebanho?',
        'Qual o preÃ§o da arroba hoje?',
        'Como estÃ¡ a performance do meu rebanho?',
        'Preciso vacinar algum animal?'
      ]
    };
    
    res.json({ 
      success: true, 
      data: response,
      chatId: chatId || `chat_${Date.now()}`
    });

  } catch (error) {
    console.error('[CHATBOT] âŒ Erro ao processar mensagem:', error);
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
    const userId = req.user?.uid;
    console.log('[CHATBOT] ðŸ“‹ Buscando sessÃµes do usuÃ¡rio:', userId);

    const chatHistoryService = new ChatHistoryService();
    const sessions = await chatHistoryService.getSessions(userId || 'anonymous');

    res.json({ 
      success: true, 
      data: sessions 
    });

  } catch (error) {
    console.error('[CHATBOT] âŒ Erro ao buscar sessÃµes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/chatbot/sessions', async (req, res) => {
  try {
    const userId = req.user?.uid;
    console.log('[CHATBOT] ðŸ†• Criando nova sessÃ£o para usuÃ¡rio:', userId);

    const chatHistoryService = new ChatHistoryService();
    const conversation = await chatHistoryService.startNewConversation(userId || 'anonymous');

    res.json({ 
      success: true, 
      chatId: conversation.chatId,
      message: 'SessÃ£o criada com sucesso'
    });

  } catch (error) {
    console.error('[CHATBOT] âŒ Erro ao criar sessÃ£o:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.get('/chatbot/sessions/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.uid;
    console.log('[CHATBOT] ðŸ” Buscando sessÃ£o:', { chatId, userId });

    const chatHistoryService = new ChatHistoryService();
    const session = await chatHistoryService.getConversation(chatId, userId || undefined);

    res.json({ 
      success: true, 
      data: session 
    });

  } catch (error) {
    console.error('[CHATBOT] âŒ Erro ao buscar sessÃ£o:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.delete('/chatbot/sessions/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.uid;
    console.log('[CHATBOT] ðŸ—‘ï¸ Deletando sessÃ£o:', { chatId, userId });

    const chatHistoryService = new ChatHistoryService();
    await chatHistoryService.deleteConversation(chatId, userId || undefined);

    res.json({ 
      success: true, 
      message: 'SessÃ£o deletada com sucesso' 
    });

  } catch (error) {
    console.error('[CHATBOT] âŒ Erro ao deletar sessÃ£o:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.delete('/chatbot/sessions', async (req, res) => {
  try {
    const userId = req.user?.uid;
    console.log('[CHATBOT] ðŸ—‘ï¸ Deletando todas as sessÃµes do usuÃ¡rio:', userId);

    const chatHistoryService = new ChatHistoryService();
    await chatHistoryService.deleteAllUserConversations(userId || 'anonymous');

    res.json({ 
      success: true, 
      message: 'Todas as sessÃµes foram deletadas com sucesso' 
    });

  } catch (error) {
    console.error('[CHATBOT] âŒ Erro ao deletar todas as sessÃµes:', error);
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
    const userId = req.user?.uid;
    
    console.log('[CHATBOT] ðŸ‘ Recebendo feedback:', { 
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
    console.error('[CHATBOT] âŒ Erro ao salvar feedback:', error);
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
    const userId = req.user?.uid;
    
    console.log('[AUTOMATED_ACTIONS] âš¡ Executando aÃ§Ã£o:', { 
      action, payload, chatId, userId 
    });

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mensagem Ã© obrigatÃ³ria' 
      });
    }

    // Mock execution - implementar aÃ§Ãµes reais
    let result = { success: true, text: '' };
    
    switch (action) {
      case 'CREATE_TRANSACTION':
        result.text = `âœ… TransaÃ§Ã£o criada: ${payload.descricao} - R$ ${payload.valor}`;
        break;
      case 'CREATE_GOAL':
        result.text = `âœ… Meta criada: ${payload.meta} - R$ ${payload.valor_total}`;
        break;
      case 'CREATE_INVESTMENT':
        result.text = `âœ… Investimento registrado: ${payload.nome} - R$ ${payload.valor}`;
        break;
      default:
        result.text = `âœ… AÃ§Ã£o ${action} executada com sucesso!`;
    }

    res.json({ 
      success: true, 
      text: result.text,
      data: { action, payload, executed: true }
    });

  } catch (error) {
    console.error('[AUTOMATED_ACTIONS] âŒ Erro ao executar aÃ§Ã£o:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/chatbot/confirm-action', async (req, res) => {
  try {
    const { actionData, action } = req.body;
    const userId = req.user?.uid;
    
    console.log('[CHATBOT] âœ… ConfirmaÃ§Ã£o de aÃ§Ã£o:', { actionData, action, userId });

    if (action === 'confirm') {
      res.json({ 
        success: true, 
        message: 'AÃ§Ã£o confirmada e executada com sucesso',
        data: { confirmed: true, executed: true }
      });
    } else {
      res.json({ 
        success: true, 
        message: 'AÃ§Ã£o cancelada',
        data: { confirmed: false, executed: false }
      });
    }

  } catch (error) {
    console.error('[CHATBOT] âŒ Erro ao confirmar aÃ§Ã£o:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/ia/analyze', async (req, res) => {
  try {
    const analysisData = req.body;
    const userId = req.user?.uid || 'anonymous';
    const ai = new WhiLabOptimizedAIService();
    const herd = await ai.analyzeHerdPerformance(userId);
    const alerts = await ai.generateSmartAlerts(userId);
    const analysis = {
      tipo: 'analise_rebanho',
      resultados: herd,
      alertas_sugeridos: alerts,
      entrada: analysisData,
      confianca: 0.85,
      timestamp: new Date()
    };

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Erro na anÃ¡lise da IA:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== RELATÃ“RIOS ====================
router.post('/reports/generate', async (req, res) => {
  try {
    const { type, filters } = req.body;
    const userId = req.user?.uid;
    const [animais, vendas, producao] = await Promise.all([
      supabaseService.getAnimais({ userId }).catch(() => []),
      supabaseService.getVendas({ userId }).catch(() => []),
      supabaseService.getProducoes({ userId }).catch(() => [])
    ]);

    const report = {
      id: Date.now().toString(),
      tipo: type,
      filtros: filters,
      status: 'CONCLUIDO',
      dataGeracao: new Date(),
      url: null,
      resumo: {
        totalAnimais: animais.length,
        totalVendas: vendas.length,
        totalProducao: producao.length
      }
    };
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Erro ao gerar relatÃ³rio:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.get('/reports/:reportId/export', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { format } = req.query;
    
    // Mock export - substituir por geraÃ§Ã£o real de PDF/Excel
    res.json({ 
      success: true, 
      message: `RelatÃ³rio ${reportId} exportado em ${format}`,
      downloadUrl: `/downloads/report-${reportId}.${format}`
    });
  } catch (error) {
    console.error('Erro ao exportar relatÃ³rio:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;

