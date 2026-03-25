// =====================================================
// WHILAB AI SERVICE - IA ESPECIALIZADA EM PECUÃRIA
// Adaptado para Supabase com conhecimento zootÃ©cnico
// =====================================================

import OpenAI from 'openai';
import { whilabSupabaseService } from './WhiLabSupabaseService';
import { IUser, IContextoIA, WHILAB_AI_KNOWLEDGE, WHATSAPP_COMMANDS } from '../types/whilab-supabase.types';
import logger from '../utils/logger';
import { AI_BRAND, SYSTEM_PROMPT, AI_MODEL_CONFIG } from '../config/aiPrompts';

export class WhiLabAIService {
  private openai: OpenAI | null = null;

  constructor() {
  }

  private getOpenAIClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY nÃ£o configurada');
    }

    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey,
        timeout: 30000,
      });
    }

    return this.openai;
  }

  // =====================================================
  // CONTEXTO ESPECIALIZADO
  // =====================================================

  private async buildWhiLabContext(userId: string): Promise<IContextoIA> {
    try {
      const usuario = await whilabSupabaseService.getUserByFirebaseUid(userId);
      const animais = await whilabSupabaseService.getAnimaisByUser(userId);
      const resumoRebanho = {
        user_id: userId,
        fazenda_nome: usuario?.fazenda_nome || 'Fazenda',
        total_animais: animais.length,
        machos: animais.filter(a => a.sexo === 'macho').length,
        femeas: animais.filter(a => a.sexo === 'femea').length,
        bezerros: animais.filter(a => a.categoria === 'bezerro').length,
        novilhos: animais.filter(a => a.categoria === 'novilho').length,
        vacas: animais.filter(a => a.categoria === 'vaca').length,
        ativos: animais.filter(a => a.status === 'ativo').length,
        vendidos: animais.filter(a => a.status === 'vendido').length,
        peso_medio: animais.length > 0 ? animais.reduce((sum, a) => sum + (a.peso_atual || 0), 0) / animais.length : 0,
        custo_total: animais.reduce((sum, a) => sum + (a.valor_compra || 0), 0)
      };

      const ultimasVendas = await whilabSupabaseService.getVendasByUser(userId);

      const alertas = await whilabSupabaseService.getAlertasByUser(userId);
      const alertasPendentes = alertas.filter(a => !a.lido);

      const precosAtuais = await whilabSupabaseService.getPrecosMercado();

      return {
        usuario: usuario!,
        rebanho_resumo: resumoRebanho,
        ultimas_vendas: ultimasVendas.slice(0, 5),
        alertas_pendentes: alertasPendentes.slice(0, 10),
        precos_atuais: precosAtuais.slice(0, 5)
      };
    } catch (error) {
      logger.error(`Erro ao construir contexto ${AI_BRAND.productName}:`, error);
      throw error;
    }
  }

  // =====================================================
  // PROMPT ESPECIALIZADO
  // =====================================================

  private getWhiLabSystemPrompt(): string {
    return `${SYSTEM_PROMPT}

## CONHECIMENTO ESPECIALIZADO
${JSON.stringify(WHILAB_AI_KNOWLEDGE, null, 2)}

## COMANDOS DISPONÃVEIS
${JSON.stringify(WHATSAPP_COMMANDS, null, 2)}
`;
  }

  // =====================================================
  // PROCESSAMENTO DE MENSAGENS
  // =====================================================

  async processMessage(
    userId: string, 
    message: string, 
    channel: 'whatsapp' | 'web' | 'mobile' = 'web'
  ): Promise<string> {
    try {
      // Construir contexto especÃ­fico do usuÃ¡rio
      const contexto = await this.buildWhiLabContext(userId);

      // Preparar prompt com contexto
      const contextPrompt = `
## CONTEXTO DA FAZENDA
**Fazenda:** ${contexto.usuario.fazenda_nome}
**Ãrea:** ${contexto.usuario.fazenda_area || 'NÃ£o informado'} hectares
**Tipo:** ${contexto.usuario.tipo_criacao || 'NÃ£o informado'}
**ExperiÃªncia:** ${contexto.usuario.experiencia_anos || 'NÃ£o informado'} anos

## RESUMO DO REBANHO
${contexto.rebanho_resumo ? `
- Total de animais: ${contexto.rebanho_resumo.total_animais}
- Machos: ${contexto.rebanho_resumo.machos} | FÃªmeas: ${contexto.rebanho_resumo.femeas}
- Ativos: ${contexto.rebanho_resumo.ativos} | Vendidos: ${contexto.rebanho_resumo.vendidos}
- Peso mÃ©dio: ${contexto.rebanho_resumo.peso_medio?.toFixed(1)} kg
- Custo acumulado: R$ ${contexto.rebanho_resumo.custo_total?.toLocaleString('pt-BR')}
` : 'Dados do rebanho nÃ£o disponÃ­veis'}

## VENDAS RECENTES (Ãºltimos 30 dias)
${contexto.ultimas_vendas.length > 0 ? 
  contexto.ultimas_vendas.map(v => 
    `- ${v.data_venda}: ${v.peso_total}kg para ${v.comprador} - R$ ${v.valor_total.toLocaleString('pt-BR')}`
  ).join('\n') 
  : 'Nenhuma venda recente'}

## ALERTAS PENDENTES
${contexto.alertas_pendentes.length > 0 ? 
  contexto.alertas_pendentes.map(a => `- ${a.titulo}: ${a.mensagem}`).join('\n')
  : 'Nenhum alerta pendente'}

## PREÃ‡OS ATUAIS DE MERCADO
${contexto.precos_atuais.length > 0 ? 
  contexto.precos_atuais.map(p => 
    `- ${p.categoria} (${p.regiao}): R$ ${p.preco_arroba}/arroba - ${p.fonte}`
  ).join('\n')
  : 'PreÃ§os nÃ£o disponÃ­veis'}

---

**PERGUNTA DO USUÃRIO:** ${message}
`;

      // Chamar OpenAI com contexto especializado
      const completion = await this.getOpenAIClient().chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.getWhiLabSystemPrompt() },
          { role: 'user', content: contextPrompt }
        ],
        max_tokens: AI_MODEL_CONFIG.maxTokens,
        temperature: AI_MODEL_CONFIG.temperature
      });

      const response = completion.choices[0]?.message?.content || 
        'Desculpe, nÃ£o consegui processar sua pergunta no momento. Tente novamente.';

      // Salvar conversa no Supabase
      await whilabSupabaseService.createChatMessage(userId, {
        message,
        response,
        channel,
        context: contexto
      });

      return response;

    } catch (error) {
      logger.error(`Erro ao processar mensagem ${AI_BRAND.productName}:`, error);
      
      // Resposta de fallback
      const fallbackResponse = this.getFallbackResponse(message);
      
      // Salvar mesmo com erro
      try {
        await whilabSupabaseService.createChatMessage(userId, {
          message,
          response: fallbackResponse,
          channel,
          context: { error: error.message }
        });
      } catch (saveError) {
        logger.error('Erro ao salvar mensagem de fallback:', saveError);
      }
      
      return fallbackResponse;
    }
  }

  // =====================================================
  // ANÃLISE DE COMANDOS ESPECÃFICOS
  // =====================================================
  
  private getFallbackResponse(message: string): string {
    const messageLower = message.toLowerCase();
    
    // Respostas baseadas em palavras-chave
    if (messageLower.includes('preÃ§o') || messageLower.includes('arroba')) {
      return `ðŸ‚ **Consulta de PreÃ§os**
      
Para consultar preÃ§os atualizados, preciso acessar os dados de mercado. 
Atualmente o sistema estÃ¡ em modo de desenvolvimento.

ðŸ’¡ **Dica:** Use comandos como:
- "${AI_BRAND.assistantName}, preco do boi hoje"
- "${AI_BRAND.assistantName}, cotacao da arroba"`;
    }
    
    if (messageLower.includes('animal') || messageLower.includes('rebanho')) {
      return `ðŸ„ **GestÃ£o do Rebanho**
      
Para consultar informaÃ§Ãµes do seu rebanho, use comandos como:
- "${AI_BRAND.assistantName}, quantos animais tenho?"
- "${AI_BRAND.assistantName}, meu rebanho"
- "${AI_BRAND.assistantName}, animais por lote"

ðŸ“Š Posso ajudar com cadastro, consultas e relatÃ³rios do rebanho.`;
    }
    
    if (messageLower.includes('venda') || messageLower.includes('vender')) {
      return `ðŸ’° **Vendas e ComercializaÃ§Ã£o**
      
Para registrar ou consultar vendas:
- "${AI_BRAND.assistantName}, registrar venda"
- "${AI_BRAND.assistantName}, vendas do mes"
- "${AI_BRAND.assistantName}, melhor preco para venda"

ðŸ“ˆ Posso ajudar com anÃ¡lise de mercado e timing de vendas.`;
    }
    
    if (messageLower.includes('vacina') || messageLower.includes('manejo')) {
      return `ðŸ’‰ **Manejo SanitÃ¡rio**
      
Para questÃµes de manejo:
- "${AI_BRAND.assistantName}, agenda de vacinacao"
- "${AI_BRAND.assistantName}, proximas vacinas"
- "${AI_BRAND.assistantName}, registrar manejo"

âš ï¸ **Importante:** Sempre consulte um veterinÃ¡rio para orientaÃ§Ãµes especÃ­ficas.`;
    }
    
    // Resposta genÃ©rica
    return `ðŸ‚ **${AI_BRAND.assistantName} - ${AI_BRAND.productDescription}**
    
OlÃ¡! Sou especializado em gestÃ£o pecuÃ¡ria. Posso ajudar com:

ðŸ„ **Rebanho:** Cadastro, consultas e relatÃ³rios
ðŸ’° **Vendas:** Registros e anÃ¡lise de mercado  
ðŸ’‰ **Manejo:** CalendÃ¡rio sanitÃ¡rio e alertas
ðŸ“Š **RelatÃ³rios:** Performance e indicadores
ðŸ’¬ **Comandos:** Use "${AI_BRAND.assistantName}, [sua pergunta]"

Como posso ajudar sua fazenda hoje?`;
  }

  // =====================================================
  // ANALISE DE IMAGENS DO ASSISTENTE
  // =====================================================
  
  async analyzeAnimalImage(
    userId: string, 
    imageUrl: string, 
    animalId?: string
  ): Promise<{
    estimatedWeight: number;
    confidence: number;
    healthStatus: string;
    recommendations: string[];
  }> {
    try {
      // Mock implementation - em produÃ§Ã£o usaria visÃ£o computacional
      logger.info(`Analisando imagem para usuÃ¡rio ${userId}: ${imageUrl}`);
      
      // SimulaÃ§Ã£o de anÃ¡lise
      const mockAnalysis = {
        estimatedWeight: Math.floor(Math.random() * 200) + 300, // 300-500kg
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        healthStatus: 'Aparentemente saudÃ¡vel',
        recommendations: [
          'Continue o manejo atual',
          'Monitore ganho de peso',
          'PrÃ³xima pesagem em 30 dias'
        ]
      };

      // Salvar anÃ¡lise como mensagem
      await whilabSupabaseService.createChatMessage(userId, {
        message: `AnÃ¡lise de imagem do animal ${animalId || 'nÃ£o identificado'}`,
        response: `ðŸ” **Analise ${AI_BRAND.assistantName} Vision**
        
ðŸ“ **Peso estimado:** ${mockAnalysis.estimatedWeight}kg
ðŸŽ¯ **ConfianÃ§a:** ${mockAnalysis.confidence}%
ðŸ©º **Status:** ${mockAnalysis.healthStatus}

ðŸ’¡ **RecomendaÃ§Ãµes:**
${mockAnalysis.recommendations.map(r => `- ${r}`).join('\n')}

âš ï¸ **Disclaimer:** Esta Ã© uma estimativa baseada em IA. Para avaliaÃ§Ãµes precisas, consulte um zootecnista.`,
        channel: 'web',
        // media_url: imageUrl, // Campo removido temporariamente
        context: { analysis: mockAnalysis, animal_id: animalId }
      });

      return mockAnalysis;

    } catch (error) {
      logger.error('Erro na anÃ¡lise de imagem:', error);
      throw error;
    }
  }

  // =====================================================
  // ALERTAS INTELIGENTES
  // =====================================================
  
  async generateSmartAlerts(userId: string): Promise<void> {
    try {
      const contexto = await this.buildWhiLabContext(userId);
      
      // Verificar alertas de vacinaÃ§Ã£o
      const manejos = await whilabSupabaseService.getManejosByUser(userId, {
        tipoManejo: 'vacinacao'
      });
      
      const proximasVacinas = manejos.filter(m => {
        if (!m.proxima_aplicacao) return false;
        const proxima = new Date(m.proxima_aplicacao);
        const agora = new Date();
        const diasRestantes = Math.ceil((proxima.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 7 && diasRestantes >= 0;
      });

      for (const manejo of proximasVacinas) {
        await whilabSupabaseService.createAlerta(userId, {
          tipo_alerta: 'vacinacao',
          titulo: 'VacinaÃ§Ã£o PrÃ³xima',
          mensagem: `Vacina ${manejo.produto_usado} vence em breve para o animal ${manejo.animal_id}`,
          data_alerta: new Date().toISOString(),
          animal_id: manejo.animal_id
        });
      }

      // Verificar alertas de mercado (preÃ§os favorÃ¡veis)
      const precos = await whilabSupabaseService.getPrecosMercado();
      const precoAtual = precos.find(p => p.categoria === 'boi_gordo')?.preco_arroba;
      
      if (precoAtual && precoAtual > 300) { // PreÃ§o acima de R$ 300/arroba
        await whilabSupabaseService.createAlerta(userId, {
          tipo_alerta: 'mercado',
          titulo: 'PreÃ§o FavorÃ¡vel para Venda',
          mensagem: `Boi gordo estÃ¡ cotado a R$ ${precoAtual}/arroba. Considere vender animais prontos.`,
          data_alerta: new Date().toISOString()
        });
      }

      logger.info(`Alertas inteligentes gerados para usuÃ¡rio ${userId}`);

    } catch (error) {
      logger.error('Erro ao gerar alertas inteligentes:', error);
    }
  }

  // =====================================================
  // RELATÃ“RIOS AUTOMATIZADOS
  // =====================================================
  
  async generateMonthlyReport(userId: string): Promise<string> {
    try {
      const contexto = await this.buildWhiLabContext(userId);
      const estatisticas = await whilabSupabaseService.getEstatisticasDashboard(userId);
      
      const relatorio = `
ðŸ‚ **RELATÃ“RIO MENSAL - ${contexto.usuario.fazenda_nome}**

ðŸ“Š **RESUMO GERAL**
- Total de animais: ${estatisticas.totalAnimais}
- Receita do mÃªs: R$ ${estatisticas.receitaMensal.toLocaleString('pt-BR')}
- GMD mÃ©dio: ${estatisticas.gmdMedio} kg/dia
- Alertas pendentes: ${estatisticas.alertasPendentes}

ðŸ’° **PERFORMANCE FINANCEIRA**
${contexto.ultimas_vendas.length > 0 ? `
- Vendas realizadas: ${contexto.ultimas_vendas.length}
- Peso total vendido: ${contexto.ultimas_vendas.reduce((sum, v) => sum + v.peso_total, 0)} kg
- Receita total: R$ ${contexto.ultimas_vendas.reduce((sum, v) => sum + v.valor_total, 0).toLocaleString('pt-BR')}
` : 'Nenhuma venda no perÃ­odo'}

ðŸŽ¯ **METAS**
- Metas concluÃ­das: ${estatisticas.metasConcluidas}

ðŸ“… **PRÃ“XIMAS AÃ‡Ã•ES**
- VacinaÃ§Ãµes agendadas: ${estatisticas.proximasVacinacoes}
- Alertas para revisar: ${estatisticas.alertasPendentes}

ðŸ’¡ **RECOMENDAÃ‡Ã•ES IA**
- Continue monitorando o GMD dos animais
- Considere aproveitar preÃ§os favorÃ¡veis de mercado
- Mantenha o calendÃ¡rio sanitÃ¡rio em dia

---
*Relatorio gerado automaticamente pelo ${AI_BRAND.assistantName}*
`;

      // Salvar relatÃ³rio como mensagem
      await whilabSupabaseService.createChatMessage(userId, {
        message: 'RelatÃ³rio mensal automatizado',
        response: relatorio,
        channel: 'web',
        context: { tipo: 'relatorio_mensal', estatisticas }
      });

      return relatorio;

    } catch (error) {
      logger.error('Erro ao gerar relatÃ³rio mensal:', error);
      throw error;
    }
  }
}

export const whilabAIService = new WhiLabAIService();

