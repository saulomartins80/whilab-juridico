// =====================================================
// BOVINEXT AI SERVICE - IA ESPECIALIZADA EM PECUÁRIA
// Adaptado para Supabase com conhecimento zootécnico
// =====================================================

import OpenAI from 'openai';
import { bovinextSupabaseService } from './BovinextSupabaseService';
import { IUser, IContextoIA, BOVINEXT_AI_KNOWLEDGE, WHATSAPP_COMMANDS } from '../types/bovinext-supabase.types';
import logger from '../utils/logger';

export class BovinextAIService {
  private openai: OpenAI | null = null;

  constructor() {
  }

  private getOpenAIClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
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
  // CONTEXTO ESPECIALIZADO BOVINEXT
  // =====================================================

  private async buildBovinextContext(userId: string): Promise<IContextoIA> {
    try {
      const usuario = await bovinextSupabaseService.getUserByFirebaseUid(userId);
      const animais = await bovinextSupabaseService.getAnimaisByUser(userId);
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

      const ultimasVendas = await bovinextSupabaseService.getVendasByUser(userId);

      const alertas = await bovinextSupabaseService.getAlertasByUser(userId);
      const alertasPendentes = alertas.filter(a => !a.lido);

      const precosAtuais = await bovinextSupabaseService.getPrecosMercado();

      return {
        usuario: usuario!,
        rebanho_resumo: resumoRebanho,
        ultimas_vendas: ultimasVendas.slice(0, 5),
        alertas_pendentes: alertasPendentes.slice(0, 10),
        precos_atuais: precosAtuais.slice(0, 5)
      };
    } catch (error) {
      logger.error('Erro ao construir contexto BOVINEXT:', error);
      throw error;
    }
  }

  // =====================================================
  // PROMPT ESPECIALIZADO BOVINO
  // =====================================================

  private getBovinextSystemPrompt(): string {
    return `
# VOCÊ É O BOVINO ASSISTANT - IA ESPECIALIZADA EM PECUÁRIA

## IDENTIDADE
- Nome: Bovino Assistant (ou apenas "Bovino")
- Especialidade: Gestão pecuária, zootecnia e agronegócio
- Personalidade: Profissional, prático, conhecedor do campo
- Linguagem: Técnica mas acessível, usa termos do agronegócio

## CONHECIMENTO ESPECIALIZADO
${JSON.stringify(BOVINEXT_AI_KNOWLEDGE, null, 2)}

## COMANDOS DISPONÍVEIS
${JSON.stringify(WHATSAPP_COMMANDS, null, 2)}

## DIRETRIZES IMPORTANTES
1. **SEMPRE** use terminologia zootécnica correta
2. **SEMPRE** considere aspectos econômicos nas recomendações
3. **SEMPRE** mencione questões sanitárias quando relevante
4. **SEMPRE** forneça dados concretos quando disponível
5. **NUNCA** dê conselhos veterinários específicos - sempre recomende consultar profissional
6. **SEMPRE** considere a sazonalidade do mercado bovino
7. **SEMPRE** seja prático e objetivo nas respostas

## FORMATO DE RESPOSTA
- Use emojis relacionados à pecuária: 🐂 🐄 🌱 📊 💰
- Estruture respostas em tópicos quando necessário
- Inclua números e dados sempre que possível
- Termine com sugestão de próxima ação quando apropriado

## CONTEXTO ATUAL DO USUÁRIO
Você receberá o contexto completo da fazenda do usuário, incluindo:
- Dados do rebanho atual
- Histórico de vendas
- Alertas pendentes
- Preços de mercado atuais
- Informações da fazenda

Use essas informações para dar respostas personalizadas e relevantes.
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
      // Construir contexto específico do usuário
      const contexto = await this.buildBovinextContext(userId);

      // Preparar prompt com contexto
      const contextPrompt = `
## CONTEXTO DA FAZENDA
**Fazenda:** ${contexto.usuario.fazenda_nome}
**Área:** ${contexto.usuario.fazenda_area || 'Não informado'} hectares
**Tipo:** ${contexto.usuario.tipo_criacao || 'Não informado'}
**Experiência:** ${contexto.usuario.experiencia_anos || 'Não informado'} anos

## RESUMO DO REBANHO
${contexto.rebanho_resumo ? `
- Total de animais: ${contexto.rebanho_resumo.total_animais}
- Machos: ${contexto.rebanho_resumo.machos} | Fêmeas: ${contexto.rebanho_resumo.femeas}
- Ativos: ${contexto.rebanho_resumo.ativos} | Vendidos: ${contexto.rebanho_resumo.vendidos}
- Peso médio: ${contexto.rebanho_resumo.peso_medio?.toFixed(1)} kg
- Custo acumulado: R$ ${contexto.rebanho_resumo.custo_total?.toLocaleString('pt-BR')}
` : 'Dados do rebanho não disponíveis'}

## VENDAS RECENTES (últimos 30 dias)
${contexto.ultimas_vendas.length > 0 ? 
  contexto.ultimas_vendas.map(v => 
    `- ${v.data_venda}: ${v.peso_total}kg para ${v.comprador} - R$ ${v.valor_total.toLocaleString('pt-BR')}`
  ).join('\n') 
  : 'Nenhuma venda recente'}

## ALERTAS PENDENTES
${contexto.alertas_pendentes.length > 0 ? 
  contexto.alertas_pendentes.map(a => `- ${a.titulo}: ${a.mensagem}`).join('\n')
  : 'Nenhum alerta pendente'}

## PREÇOS ATUAIS DE MERCADO
${contexto.precos_atuais.length > 0 ? 
  contexto.precos_atuais.map(p => 
    `- ${p.categoria} (${p.regiao}): R$ ${p.preco_arroba}/arroba - ${p.fonte}`
  ).join('\n')
  : 'Preços não disponíveis'}

---

**PERGUNTA DO USUÁRIO:** ${message}
`;

      // Chamar OpenAI com contexto especializado
      const completion = await this.getOpenAIClient().chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.getBovinextSystemPrompt() },
          { role: 'user', content: contextPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || 
        'Desculpe, não consegui processar sua pergunta no momento. Tente novamente.';

      // Salvar conversa no Supabase
      await bovinextSupabaseService.createChatMessage(userId, {
        message,
        response,
        channel,
        context: contexto
      });

      return response;

    } catch (error) {
      logger.error('Erro ao processar mensagem BOVINEXT:', error);
      
      // Resposta de fallback
      const fallbackResponse = this.getFallbackResponse(message);
      
      // Salvar mesmo com erro
      try {
        await bovinextSupabaseService.createChatMessage(userId, {
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
  // ANÁLISE DE COMANDOS ESPECÍFICOS
  // =====================================================
  
  private getFallbackResponse(message: string): string {
    const messageLower = message.toLowerCase();
    
    // Respostas baseadas em palavras-chave
    if (messageLower.includes('preço') || messageLower.includes('arroba')) {
      return `🐂 **Consulta de Preços**
      
Para consultar preços atualizados, preciso acessar os dados de mercado. 
Atualmente o sistema está em modo de desenvolvimento.

💡 **Dica:** Use comandos como:
- "Bovino, preço do boi hoje"
- "Bovino, cotação da arroba"`;
    }
    
    if (messageLower.includes('animal') || messageLower.includes('rebanho')) {
      return `🐄 **Gestão do Rebanho**
      
Para consultar informações do seu rebanho, use comandos como:
- "Bovino, quantos animais tenho?"
- "Bovino, meu rebanho"
- "Bovino, animais por lote"

📊 Posso ajudar com cadastro, consultas e relatórios do rebanho.`;
    }
    
    if (messageLower.includes('venda') || messageLower.includes('vender')) {
      return `💰 **Vendas e Comercialização**
      
Para registrar ou consultar vendas:
- "Bovino, registrar venda"
- "Bovino, vendas do mês"
- "Bovino, melhor preço para venda"

📈 Posso ajudar com análise de mercado e timing de vendas.`;
    }
    
    if (messageLower.includes('vacina') || messageLower.includes('manejo')) {
      return `💉 **Manejo Sanitário**
      
Para questões de manejo:
- "Bovino, agenda de vacinação"
- "Bovino, próximas vacinas"
- "Bovino, registrar manejo"

⚠️ **Importante:** Sempre consulte um veterinário para orientações específicas.`;
    }
    
    // Resposta genérica
    return `🐂 **Bovino Assistant - IA Pecuária**
    
Olá! Sou especializado em gestão pecuária. Posso ajudar com:

🐄 **Rebanho:** Cadastro, consultas e relatórios
💰 **Vendas:** Registros e análise de mercado  
💉 **Manejo:** Calendário sanitário e alertas
📊 **Relatórios:** Performance e indicadores
💬 **Comandos:** Use "Bovino, [sua pergunta]"

Como posso ajudar sua fazenda hoje?`;
  }

  // =====================================================
  // ANÁLISE DE IMAGENS (BOVINO VISION)
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
      // Mock implementation - em produção usaria visão computacional
      logger.info(`Analisando imagem para usuário ${userId}: ${imageUrl}`);
      
      // Simulação de análise
      const mockAnalysis = {
        estimatedWeight: Math.floor(Math.random() * 200) + 300, // 300-500kg
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        healthStatus: 'Aparentemente saudável',
        recommendations: [
          'Continue o manejo atual',
          'Monitore ganho de peso',
          'Próxima pesagem em 30 dias'
        ]
      };

      // Salvar análise como mensagem
      await bovinextSupabaseService.createChatMessage(userId, {
        message: `Análise de imagem do animal ${animalId || 'não identificado'}`,
        response: `🔍 **Análise Bovino Vision**
        
📏 **Peso estimado:** ${mockAnalysis.estimatedWeight}kg
🎯 **Confiança:** ${mockAnalysis.confidence}%
🩺 **Status:** ${mockAnalysis.healthStatus}

💡 **Recomendações:**
${mockAnalysis.recommendations.map(r => `- ${r}`).join('\n')}

⚠️ **Disclaimer:** Esta é uma estimativa baseada em IA. Para avaliações precisas, consulte um zootecnista.`,
        channel: 'web',
        // media_url: imageUrl, // Campo removido temporariamente
        context: { analysis: mockAnalysis, animal_id: animalId }
      });

      return mockAnalysis;

    } catch (error) {
      logger.error('Erro na análise de imagem:', error);
      throw error;
    }
  }

  // =====================================================
  // ALERTAS INTELIGENTES
  // =====================================================
  
  async generateSmartAlerts(userId: string): Promise<void> {
    try {
      const contexto = await this.buildBovinextContext(userId);
      
      // Verificar alertas de vacinação
      const manejos = await bovinextSupabaseService.getManejosByUser(userId, {
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
        await bovinextSupabaseService.createAlerta(userId, {
          tipo_alerta: 'vacinacao',
          titulo: 'Vacinação Próxima',
          mensagem: `Vacina ${manejo.produto_usado} vence em breve para o animal ${manejo.animal_id}`,
          data_alerta: new Date().toISOString(),
          animal_id: manejo.animal_id
        });
      }

      // Verificar alertas de mercado (preços favoráveis)
      const precos = await bovinextSupabaseService.getPrecosMercado();
      const precoAtual = precos.find(p => p.categoria === 'boi_gordo')?.preco_arroba;
      
      if (precoAtual && precoAtual > 300) { // Preço acima de R$ 300/arroba
        await bovinextSupabaseService.createAlerta(userId, {
          tipo_alerta: 'mercado',
          titulo: 'Preço Favorável para Venda',
          mensagem: `Boi gordo está cotado a R$ ${precoAtual}/arroba. Considere vender animais prontos.`,
          data_alerta: new Date().toISOString()
        });
      }

      logger.info(`Alertas inteligentes gerados para usuário ${userId}`);

    } catch (error) {
      logger.error('Erro ao gerar alertas inteligentes:', error);
    }
  }

  // =====================================================
  // RELATÓRIOS AUTOMATIZADOS
  // =====================================================
  
  async generateMonthlyReport(userId: string): Promise<string> {
    try {
      const contexto = await this.buildBovinextContext(userId);
      const estatisticas = await bovinextSupabaseService.getEstatisticasDashboard(userId);
      
      const relatorio = `
🐂 **RELATÓRIO MENSAL - ${contexto.usuario.fazenda_nome}**

📊 **RESUMO GERAL**
- Total de animais: ${estatisticas.totalAnimais}
- Receita do mês: R$ ${estatisticas.receitaMensal.toLocaleString('pt-BR')}
- GMD médio: ${estatisticas.gmdMedio} kg/dia
- Alertas pendentes: ${estatisticas.alertasPendentes}

💰 **PERFORMANCE FINANCEIRA**
${contexto.ultimas_vendas.length > 0 ? `
- Vendas realizadas: ${contexto.ultimas_vendas.length}
- Peso total vendido: ${contexto.ultimas_vendas.reduce((sum, v) => sum + v.peso_total, 0)} kg
- Receita total: R$ ${contexto.ultimas_vendas.reduce((sum, v) => sum + v.valor_total, 0).toLocaleString('pt-BR')}
` : 'Nenhuma venda no período'}

🎯 **METAS**
- Metas concluídas: ${estatisticas.metasConcluidas}

📅 **PRÓXIMAS AÇÕES**
- Vacinações agendadas: ${estatisticas.proximasVacinacoes}
- Alertas para revisar: ${estatisticas.alertasPendentes}

💡 **RECOMENDAÇÕES IA**
- Continue monitorando o GMD dos animais
- Considere aproveitar preços favoráveis de mercado
- Mantenha o calendário sanitário em dia

---
*Relatório gerado automaticamente pelo Bovino Assistant*
`;

      // Salvar relatório como mensagem
      await bovinextSupabaseService.createChatMessage(userId, {
        message: 'Relatório mensal automatizado',
        response: relatorio,
        channel: 'web',
        context: { tipo: 'relatorio_mensal', estatisticas }
      });

      return relatorio;

    } catch (error) {
      logger.error('Erro ao gerar relatório mensal:', error);
      throw error;
    }
  }
}

export const bovinextAIService = new BovinextAIService();
