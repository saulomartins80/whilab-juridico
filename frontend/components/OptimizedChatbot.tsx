import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Send, Bot, CheckCircle, X, Lightbulb, TrendingUp, Trash2, Brain, Rocket, Target, Copy, ThumbsUp, MessageCircle, XCircle, Sparkles, Zap, Plus, Clock, ChevronLeft, Mic, Square, Calendar } from 'lucide-react';
import { useOptimizedChat } from '../src/hooks/useOptimizedChat';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { toast } from 'react-toastify';
import { dashboardBranding } from '../config/branding';
import { chatbotAPI } from '../services/api'; // Importar API do chatbot
import ClaudeStyleMediaUpload from './ClaudeStyleMediaUpload';
import api from '../services/api';
import WebSearchResults, { extractSearchResults } from './WebSearchResults';
import DataCorrectionModal from './DataCorrectionModal';
import BusinessDataCharts from './BusinessDataCharts';

type MessageAttachment = {
  type: 'image' | 'audio';
  url: string;
  alt?: string;
  title?: string;
  mimeType?: string;
};

async function prepareImageForUpload(file: File): Promise<File> {
  try {
    if (typeof window === 'undefined') return file;
    if (!file.type.startsWith('image/')) return file;
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

    const shouldCompress = file.size > 700 * 1024;
    if (!shouldCompress) return file;

    const maxDim = 1600;
    const quality = 0.78;

    let width = 0;
    let height = 0;
    let drawSource: CanvasImageSource;

    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(file);
      width = bitmap.width;
      height = bitmap.height;
      drawSource = bitmap;
    } else {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const el = new window.Image();
        el.onload = () => {
          URL.revokeObjectURL(url);
          resolve(el);
        };
        el.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Falha ao carregar imagem'));
        };
        el.src = url;
      });
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
      drawSource = img;
    }

    const scale = Math.min(1, maxDim / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(drawSource, 0, 0, targetW, targetH);

    const outMime = 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outMime, quality));
    if (!blob) return file;

    if (blob.size >= file.size * 0.95) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.jpg`, { type: outMime });
  } catch {
    return file;
  }
}

// ===== TIPOS ENTERPRISE =====
interface EnterpriseMessage {
  id: string;
  sender: 'user' | 'assistant' | 'bot';
  content: string | React.ReactElement;
  timestamp: Date;
  metadata?: {
    // Funcionalidades Enterprise
    reasoning?: string;
    actions?: Array<{
      type: string;
      description: string;
      executed: boolean;
    }>;
    insights?: {
      type: string;
      content: string;
      confidence: number;
    };
    confidence?: number;
    complexity?: number;
    personalityAdaptation?: {
      level: string;
      adjustments: string[];
    };
    
    // Funcionalidades existentes
    isStreaming?: boolean;
    isComplete?: boolean;
    actionExecuted?: boolean;
    requiresConfirmation?: boolean;
    actionData?: {
      type: string;
      entities: Record<string, unknown>;
      userId: string;
    };
    recommendations?: Array<{
      title: string;
      action?: string;
      description?: string;
    }>;
    nextSteps?: string[];
    followUpQuestions?: string[];
    
    // Novos campos Enterprise
    userSophistication?: number;
    businessImpact?: number;
    automationSuccess?: boolean;
    competitiveAdvantage?: string[];
    roiProjection?: {
      timeSaved: string;
      moneySaved: string;
      decisionsImproved: string;
    };
    richAttachments?: MessageAttachment[];
    source?: string;
    // Business Mode Data
    business?: boolean;
    companyId?: string;
    companyName?: string;
    businessData?: {
      metrics?: Record<string, number>;
      alerts?: Array<{
        id: string;
        type: 'critical' | 'warning' | 'info';
        category: string;
        title: string;
        description: string;
        impact?: string;
        suggestedAction?: string;
        value?: number;
      }>;
      insights?: string[];
      visualizations?: {
        cashFlowChart?: { type: string; data: Array<Record<string, unknown>> };
        revenueExpenseChart?: { type: string; data: Record<string, number> };
        liquidityGauge?: { type: string; value: number; min: number; max: number; zones: Array<{ value: number; color: string }> };
      };
    };
  };
}

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

// ===== SISTEMA DE TEMAS ENTERPRISE =====
const getEnterpriseTheme = (plan?: string) => {
  const themes = {
    enterprise: {
      name: 'Enterprise',
      primary: '#6366f1',
      secondary: '#8b5cf6',
      gradient: 'from-indigo-600 via-purple-600 to-blue-600',
      bubbleUser: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      bubbleBot: 'bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800',
      text: 'text-gray-900 dark:text-white',
      icon: '🚀',
      accent: 'text-indigo-600 dark:text-indigo-400',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      border: 'border-indigo-300 dark:border-indigo-600',
      chatBg: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900',
      headerBg: 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
      inputBg: 'bg-white dark:bg-gray-700 border-indigo-300 dark:border-indigo-600'
    },
    premium: {
      name: 'Premium',
      primary: '#f59e0b',
      secondary: '#d97706',
      gradient: 'from-amber-500 to-orange-600',
      bubbleUser: 'bg-gradient-to-r from-amber-500 to-orange-600',
      bubbleBot: 'bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800',
      text: 'text-gray-900 dark:text-white',
      icon: '⭐',
      accent: 'text-amber-600 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700',
      border: 'border-amber-300 dark:border-amber-600',
      chatBg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-amber-900',
      headerBg: 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
      inputBg: 'bg-white dark:bg-gray-700 border-amber-300 dark:border-amber-600'
    },
    default: {
      name: 'Standard',
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      gradient: 'from-blue-500 to-blue-600',
      bubbleUser: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bubbleBot: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-white',
      icon: '💬',
      accent: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-300 dark:border-blue-600',
      chatBg: 'bg-gray-50 dark:bg-gray-800',
      headerBg: 'bg-white dark:bg-gray-900',
      inputBg: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
    }
  };

  if (plan?.toLowerCase().includes('enterprise')) return themes.enterprise;
  if (plan?.toLowerCase().includes('premium') || plan?.toLowerCase().includes('top')) return themes.premium;
  return themes.default;
};

// ===== COMPONENTE DE INSIGHTS ENTERPRISE =====
const EnterpriseInsights: React.FC<{ 
  insights: {
    type: string;
    content: string;
    confidence: number;
    userSophistication?: number;
    businessImpact?: number;
    roiProjection?: {
      timeSaved: string;
      moneySaved: string;
      decisionsImproved: string;
    };
    competitiveAdvantage?: string[];
  }; 
  theme: {
    accent: string;
    text: string;
    border: string;
    gradient: string;
  }; 
}> = ({ insights, theme }) => {
  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 p-4 rounded-lg border ${theme.border} bg-gradient-to-r ${theme.gradient} bg-opacity-10`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className={`w-5 h-5 ${theme.accent}`} />
        <span className="font-semibold text-sm">Insights Enterprise</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {insights.userSophistication && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Sofisticação:</span>
            <div className="flex items-center gap-1">
              <div className={`w-full bg-gray-200 rounded-full h-2`}>
                <div 
                  className={`bg-gradient-to-r ${theme.gradient} h-2 rounded-full`}
                  style={{ width: `${insights.userSophistication * 10}%` }}
                />
              </div>
              <span className="text-xs">{insights.userSophistication}/10</span>
            </div>
          </div>
        )}
        
        {insights.businessImpact && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Impacto:</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-medium">{insights.businessImpact}/10</span>
            </div>
          </div>
        )}
        
        {insights.roiProjection && (
          <div className="col-span-2">
            <span className="text-gray-600 dark:text-gray-400">ROI Projetado:</span>
            <div className="flex gap-4 mt-1 text-xs">
              <span>⏱️ {insights.roiProjection.timeSaved}</span>
              <span>💰 {insights.roiProjection.moneySaved}</span>
              <span>📈 {insights.roiProjection.decisionsImproved}</span>
            </div>
          </div>
        )}
      </div>
      
      {insights.competitiveAdvantage && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-600 dark:text-gray-400">Vantagens:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {insights.competitiveAdvantage.slice(0, 3).map((advantage: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs"
              >
                {advantage}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ===== COMPONENTE DE AÇÕES EXECUTADAS =====
const ExecutedActions: React.FC<{ 
  actions: Array<{
    type: string;
    description: string;
    executed: boolean;
    data?: Record<string, unknown>;
  }>; 
}> = ({ actions }) => {
  console.log('[ExecutedActions] 🎯 Rendering with actions:', actions);
  if (!actions || actions.length === 0) {
    console.log('[ExecutedActions] ⚠️ No actions to display');
    return null;
  }

  // Função para formatar valor em BRL
  const formatBRL = (value: number | string | undefined) => {
    if (value === undefined || value === null) return null;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  // Função para determinar o ícone e cor baseado no tipo
  const getActionStyle = (type: string) => {
    const typeUpper = type?.toUpperCase() || '';
    if (typeUpper.includes('CREATE') || typeUpper.includes('TRANSACTION') || typeUpper.includes('GOAL')) {
      return { icon: '✅', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' };
    }
    if (typeUpper.includes('EDIT') || typeUpper.includes('UPDATE')) {
      return { icon: '✏️', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' };
    }
    if (typeUpper.includes('DELETE')) {
      return { icon: '🗑️', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' };
    }
    return { icon: '⚡', bgColor: 'bg-purple-50 dark:bg-purple-900/20', borderColor: 'border-purple-200 dark:border-purple-800' };
  };

  // Função para extrair dados relevantes do automationData
  const extractDisplayData = (data: Record<string, unknown> | undefined) => {
    if (!data) return null;
    
    const result: { label: string; value: string }[] = [];
    
    // SKU
    if (data.sku) result.push({ label: '🔖 SKU', value: String(data.sku) });
    
    // Descrição
    if (data.descricao) result.push({ label: '📝 Descrição', value: String(data.descricao) });
    if (data.nome_da_meta || data.meta) result.push({ label: '🎯 Meta', value: String(data.nome_da_meta || data.meta) });
    if (data.name) result.push({ label: '📋 Nome', value: String(data.name) });
    if (data.titulo) result.push({ label: '📅 Título', value: String(data.titulo) });
    
    // Valor
    if (data.valor) result.push({ label: '💰 Valor', value: formatBRL(data.valor as number) || String(data.valor) });
    if (data.valor_total) result.push({ label: '💰 Valor Total', value: formatBRL(data.valor_total as number) || String(data.valor_total) });
    if (data.limit) result.push({ label: '💳 Limite', value: formatBRL(data.limit as number) || String(data.limit) });
    
    // Tipo/Categoria
    if (data.tipo) result.push({ label: '🏷️ Tipo', value: String(data.tipo) });
    if (data.categoria) result.push({ label: '📂 Categoria', value: String(data.categoria) });
    
    // Data
    if (data.data) result.push({ label: '📆 Data', value: new Date(String(data.data)).toLocaleDateString('pt-BR') });
    if (data.dataAgendamento) result.push({ label: '📆 Agendado', value: new Date(String(data.dataAgendamento)).toLocaleString('pt-BR') });
    
    // Banco (para cartões)
    if (data.bank) result.push({ label: '🏦 Banco', value: String(data.bank) });
    
    return result.length > 0 ? result : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-2"
    >
      {actions.filter(a => a.executed).map((action, index) => {
        const style = getActionStyle(action.type);
        const displayData = extractDisplayData(action.data);
        
        return (
          <div 
            key={index}
            className={`p-3 rounded-lg border ${style.borderColor} ${style.bgColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{style.icon}</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                Registro {action.type?.includes('delete') ? 'Excluído' : action.type?.includes('edit') ? 'Atualizado' : 'Criado'}
              </span>
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            </div>
            
            {displayData && displayData.length > 0 && (
              <div className="text-sm space-y-1.5 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {displayData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 ml-2 truncate max-w-[180px]" title={item.value}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

// ===== COMPONENTE DE STATUS DAS AÇÕES EM TEMPO REAL =====
const ActionProgressStatus: React.FC<{
  actionStatus?: {
    isActive: boolean;
    currentAction: string;
    progress: Array<{
      step: string;
      status: 'pending' | 'running' | 'completed' | 'error';
      timestamp: number;
    }>;
  };
}> = ({ actionStatus }) => {
  if (!actionStatus?.isActive || actionStatus.progress.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Bot className="w-3 h-3 text-blue-500" /></motion.div>;
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 1000) return 'agora';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`;
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-4 mx-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-blue-500" />
        <span className="font-medium text-sm text-blue-700 dark:text-blue-300">
          {actionStatus.currentAction}
        </span>
      </div>
      
      <div className="space-y-1">
        {actionStatus.progress.slice(-3).map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs"
          >
            {getStatusIcon(step.status)}
            <span className={`flex-1 ${step.status === 'completed' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {step.step}
            </span>
            <span className="text-gray-500 text-[10px]">
              {formatTime(step.timestamp)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ===== COMPONENTE DE MENSAGEM ENTERPRISE =====
const EnterpriseMessageBubble: React.FC<{
  message: EnterpriseMessage;
  theme: {
    accent: string;
    text: string;
    bubbleUser: string;
    bubbleBot: string;
    border: string;
    name: string;
    gradient: string;
    button: string;
  };
  onFeedback: (messageId: string) => void;
  avatarUrl?: string;
  showBusinessData?: boolean;
}> = ({ message, theme, onFeedback, avatarUrl, showBusinessData = false }) => {
  const isUser = message.sender === 'user';
  const isStreaming = message.metadata?.isStreaming;
  const hasRichAttachments = Array.isArray(message.metadata?.richAttachments) && message.metadata!.richAttachments!.length > 0;
  const contentText = typeof message.content === 'string' ? message.content.trim() : null;
  const isPlaceholderAttachmentMessage =
    isUser
    && hasRichAttachments
    && !!contentText
    && ['imagem enviada para análise', 'imagem enviada para analise', 'áudio enviado para análise', 'audio enviado para analise']
      .includes(contentText.toLowerCase());
  const shouldRenderBubble = !(isUser && hasRichAttachments && (!contentText || isPlaceholderAttachmentMessage));
  
  console.log('[EnterpriseMessageBubble] Rendering message:', {
    id: message.id,
    sender: message.sender,
    content: typeof message.content === 'string' ? message.content.substring(0, 50) + '...' : '[ReactElement]',
    isStreaming,
    timestamp: message.timestamp
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.2, 
        ease: "easeOut"
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      style={{ 
        // Prevenir tremor durante streaming
        willChange: isStreaming ? 'contents' : 'auto',
        // Suavizar renderização de texto
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-2 border-2 border-green-200 dark:border-green-600 overflow-hidden">
            <Image src={dashboardBranding.assistantAvatarSrc} alt={dashboardBranding.assistantAvatarAlt} width={28} height={28} className="object-contain" />
          </div>
        )}

        {/* Anexos (fora do balão principal para a imagem ficar "livre") */}
        {message.metadata?.richAttachments && message.metadata.richAttachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.metadata.richAttachments.map((attachment, index) => {
              if (attachment.type === 'image') {
                return (
                  <div
                    key={`attachment-${message.id}-${index}`}
                    className="rounded-2xl overflow-hidden bg-transparent"
                  >
                    <div className="relative w-full">
                      <Image
                        src={attachment.url}
                        alt={attachment.alt || attachment.title || 'Imagem analisada'}
                        width={800}
                        height={800}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                );
              }
              if (attachment.type === 'audio') {
                return (
                  <div
                    key={`attachment-${message.id}-${index}`}
                    className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500 rounded-full">
                        <Mic className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {attachment.title || 'Áudio enviado'}
                      </span>
                    </div>
                    <audio
                      controls
                      preload="metadata"
                      className="mt-2 w-full"
                    >
                      <source
                        src={attachment.url}
                        type={attachment.mimeType || 'audio/webm'}
                      />
                      Seu navegador não suporta reprodução de áudio.
                    </audio>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Bubble */}
        {shouldRenderBubble && (
          <div className={`
            px-4 py-3 rounded-2xl
            ${isUser ? 'bg-blue-500/10 dark:bg-blue-500/20' : ''}
            ${theme.text}
          `}>
            {/* Conteúdo */}
            <div 
              className="whitespace-pre-wrap leading-relaxed text-sm space-y-3"
              style={{
                // Prevenir tremor durante streaming
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                // Manter tamanho mínimo para evitar layout shift
                minHeight: isStreaming ? '1.5em' : 'auto'
              }}
            >
              {typeof message.content === 'string' ? (
                (() => {
                  // Extrair resultados de pesquisa web se existirem
                  const { cleanText, searchData } = extractSearchResults(message.content);
                  
                  return (
                    <>
                      {/* Renderizar card de pesquisa web se existir */}
                      {searchData && <WebSearchResults data={searchData} />}
                      
                      {/* Renderizar texto limpo - sem animação por linha durante streaming */}
                      <div className="space-y-1 break-words">
                        {isStreaming ? (
                          // Durante streaming: renderizar tudo junto para evitar tremor
                          <div className="leading-6">{cleanText}</div>
                        ) : (
                          // Após streaming: renderizar por linhas
                          cleanText.split('\n').map((line, index) => (
                            <div key={index} className={line.trim() === '' ? 'h-2' : 'leading-6'}>
                              {line.trim() === '' ? null : line}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  );
                })()
              ) : (
                message.content
              )}
            </div>

            {/* Indicador de confiança - REMOVIDO para não poluir */}

            {/* Streaming indicator (somente os pontos, sem texto para evitar duplicidade de "Analisando...") */}
            {isStreaming && (
              <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Insights Enterprise */}
        {!isUser && message.metadata?.insights && (
          <EnterpriseInsights insights={message.metadata.insights} theme={theme} />
        )}
        
        {/* Ações Executadas */}
        {!isUser && message.metadata?.actions && (
          <ExecutedActions actions={message.metadata.actions} />
        )}
        
        {/* Debug de ações */}
        {(() => {
          if (!isUser && message.metadata?.actions) {
            console.log('[OptimizedChatbot] 📩 Message actions:', message.metadata.actions);
          }
          return null;
        })()}
        {/* 🔧 CORREÇÃO: Removido botões duplicados - usar apenas o banner de confirmação */}
        
        {/* Recomendações */}
        {!isUser && message.metadata?.recommendations && message.metadata.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Recomendações:
            </div>
            {message.metadata.recommendations.map((rec, index) => (
              <div key={index} className={`p-2 rounded border ${theme.border} bg-yellow-50 dark:bg-yellow-900/20`}>
                <div className="text-sm font-medium">{rec.title}</div>
                {rec.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.description}</div>
                )}
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Próximos Passos */}
        {!isUser && message.metadata?.nextSteps && message.metadata.nextSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Próximos Passos:
            </div>
            {message.metadata.nextSteps.map((step, index) => (
              <div key={index} className={`p-2 rounded border ${theme.border} bg-blue-50 dark:bg-blue-900/20`}>
                <div className="text-sm flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {step}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Business Data Charts - Gráficos do modo Business */}
        {!isUser && showBusinessData && message.metadata?.businessData && (
          <BusinessDataCharts businessData={message.metadata.businessData} />
        )}
        
        {/* Timestamp e ações */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{message.timestamp.toLocaleTimeString()}</span>
          
          {!isUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(typeof message.content === 'string' ? message.content : '')}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => onFeedback(message.id)}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
export default function OptimizedChatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps) {
  const { subscription } = useAuth();
  const { mode, currentCompany } = useBusiness();
  
  // Estados principais
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isViewingHistorySession, setIsViewingHistorySession] = useState(false);
  const [chatSessions, setChatSessions] = useState<Array<{ chatId: string; title: string; createdAt: string; messageCount: number }>>([]);
  const [deleteConversation, setDeleteConversation] = useState<{ chatId: string | null; title?: string } | null>(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [audioState, setAudioState] = useState({
    isRecording: false,
    audioBlob: null as Blob | null,
    audioUrl: null as string | null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');
  const liveTranscriptHadFinalRef = useRef<boolean>(false);

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    chatId,
    connectionStatus,
    pendingAction,
    actionStatus,
    dataCorrectionModal,
    sendMessage,
    createSession,
    retryLastMessage,
    cancelCurrentRequest,
    clearMessages,
    clearPendingAction,
    loadChatSession,
    addCustomMessage,
    hasMessages,
    closeDataCorrectionModal
  } = useOptimizedChat();

  // Verificar se usuário é premium (subscription do Supabase não tem 'plan', usar fallback)
  const userPlan = (subscription as unknown as { plan?: string })?.plan || 'default';
  const isPremiumUser = userPlan.includes('premium') ||
                        userPlan.includes('enterprise') ||
                        userPlan.includes('top');

  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const theme = getEnterpriseTheme(userPlan);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toast quando ação é executada
  useEffect(() => {
    const last = messages[messages.length - 1];
    const executed = Array.isArray(last?.metadata?.actions)
      ? last.metadata.actions.some((a: { executed: boolean }) => a.executed)
      : false;
    if (executed) {
      // Toast removido: feedback visual já existe no ExecutedActions
    }
  }, [messages]);

  // Handler para envio de mensagem
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() && !pendingImage) return;
    
    try {
      // Limpar input IMEDIATAMENTE ao enviar
      const textToSend = content.trim();
      setInputValue('');

      // Se houver imagem anexada, criar bolha do usuário com thumbnail
      if (pendingImage) {
        // Guardar a imagem atual e limpar o estado imediatamente
        const imageToSend = pendingImage;
        setPendingImage(null);

        const userText = textToSend;
        addCustomMessage('user', userText, {
          attachments: [
            {
              type: 'image',
              url: imageToSend.preview,
              alt: 'Imagem enviada',
              title: 'Imagem enviada',
            },
          ],
          metadata: { source: 'user_image' },
        });

        // Enviar imagem para backend Vision
        try {
          // Garantir que temos um chatId real vinculado à sessão
          let activeChatId = chatId;
          if (!activeChatId) {
            try {
              activeChatId = await createSession();
            } catch (sessionError) {
              console.error('[OptimizedChatbot] Erro ao criar sessão para imagem:', sessionError);
            }
          }

          const formData = new FormData();
          const optimizedFile = await prepareImageForUpload(imageToSend.file);
          formData.append('file', optimizedFile);
          if (activeChatId) {
            formData.append('chatId', activeChatId);
          }

          const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '';
          formData.append('mode', mode);
          if (mode === 'business' && currentCompany?.id) {
            formData.append('companyId', currentCompany.id);
          }
          formData.append('currentRoute', currentRoute);

          formData.append(
            'promptHint',
            'Analise esta imagem financeira em detalhes. Identifique valores, datas, categorias, descrições de transações, extratos bancários, notas fiscais ou qualquer informação financeira relevante. Seja específico e detalhado.',
          );

          // Status de imagem: UI já mostra loader durante processamento

          const response = await api.post('/api/chatbot/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const data = response.data as { success?: boolean; summary?: string; message?: string };

          if (!data || !data.success) {
            throw new Error((data && data.message) || 'Erro na análise da imagem');
          }

          // Sucesso silencioso: resposta aparece na bolha do chat

          const imageSummary = data.summary || '';

          const combinedPrompt = [
            userText,
            '',
            '[Resumo da imagem]:',
            imageSummary,
          ].join('\n');

          const useStreaming = true;
          console.log('[OptimizedChatbot] Enviando mensagem (texto + imagem) com streaming:', {
            combinedPrompt,
            useStreaming,
          });
          // skipUserMessage: já criamos a bolha do usuário com a imagem acima
          await sendMessage(combinedPrompt, { useStreaming, skipUserMessage: true });
        } catch (error) {
          console.error('Erro ao analisar imagem ou enviar mensagem:', error);
          toast.error('Erro ao analisar imagem');
        }
      } else {
        // Fluxo normal (sem imagem)
        const useStreaming = true; // Streaming inclui dados completos da busca web
        console.log('[OptimizedChatbot] Enviando mensagem com streaming:', {
          content: textToSend,
          useStreaming,
          isPremiumUser,
        });
        await sendMessage(textToSend, { useStreaming });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
      // Em caso de erro, restaurar o conteúdo no input
      setInputValue(content);
    }
  }, [sendMessage, isPremiumUser, pendingImage, addCustomMessage, chatId, createSession, mode, currentCompany]);

  // Funções de áudio
  const sendAudioForTranscription = useCallback(async (audioBlob: Blob) => {
    try {
      // Criar URL local para exibir o player de áudio no chat
      const audioUrl = URL.createObjectURL(audioBlob);

      // Adicionar bolha de mensagem do usuário com o áudio como anexo
      addCustomMessage('user', '', {
        attachments: [
          {
            type: 'audio',
            url: audioUrl,
            title: 'Áudio enviado',
            mimeType: audioBlob.type || undefined,
          },
        ],
        metadata: { source: 'user_voice' },
      });

      const formData = new FormData();
      const mimeType = audioBlob.type || 'audio/webm';
      const extension =
        mimeType.includes('wav') ? 'wav' :
        mimeType.includes('mpeg') ? 'mp3' :
        mimeType.includes('ogg') ? 'ogg' :
        mimeType.includes('webm') ? 'webm' :
        'audio';

      formData.append('file', audioBlob, `recording.${extension}`);
      formData.append('chatId', `voice_${Date.now()}`);

      const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '';
      formData.append('mode', mode);
      if (mode === 'business' && currentCompany?.id) {
        formData.append('companyId', currentCompany.id);
      }
      formData.append('currentRoute', currentRoute);

      // Status de áudio: UI já mostra loader durante processamento

      const response = await api.post('/api/chatbot/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data as { success?: boolean; message?: string; text?: string };

      if (data && data.success) {
        // Sucesso silencioso: transcrição aparece na bolha do chat

        const transcript = (data.text || '').trim();
        if (transcript.length > 0) {
          // Enviar a transcrição para o Finn como se fosse uma mensagem de texto,
          // mas sem criar uma nova bolha de mensagem do usuário (já temos o balão de áudio).
          const useStreaming = true;
          await sendMessage(transcript, { useStreaming, skipUserMessage: true });
        }

        setAudioState({ isRecording: false, audioBlob: null, audioUrl: null });
      } else {
        const message = data?.message || 'Erro na transcrição de áudio';
        throw new Error(message);
      }
    } catch (error) {
      console.error('Erro na transcrição:', error);
      toast.error('❌ Erro ao transcrever áudio');
    }
  }, [sendMessage, addCustomMessage, mode, currentCompany]);

  const startRecording = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        toast.error('Seu navegador não suporta gravação de áudio.');
        return;
      }

      if (typeof window !== 'undefined') {
        const host = window.location?.hostname;
        const isLocalhost = host === 'localhost' || host === '127.0.0.1';
        if (!window.isSecureContext && !isLocalhost) {
          toast.error('Para usar o microfone, acesse o site via HTTPS.');
          return;
        }
      }

      if (audioState.isRecording) {
        return;
      }

      try {
        const rec = speechRecognitionRef.current;
        if (rec && typeof rec.stop === 'function') {
          rec.stop();
        }
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;

      try {
        const existingStream = mediaStreamRef.current;
        if (existingStream) {
          existingStream.getTracks().forEach((t) => t.stop());
        }
      } catch {
        // ignore
      }
      mediaStreamRef.current = null;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      liveTranscriptRef.current = '';
      liveTranscriptHadFinalRef.current = false;
      speechRecognitionRef.current = null;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognitionCtor) {
          const recognition = new SpeechRecognitionCtor();
          recognition.lang = 'pt-BR';
          recognition.continuous = true;
          recognition.interimResults = true;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognition.onresult = (event: any) => {
            try {
              let interim = '';
              let finalText = '';
              for (let i = event.resultIndex; i < event.results.length; i++) {
                const r = event.results[i];
                const transcript = String(r?.[0]?.transcript || '');
                if (r.isFinal) {
                  finalText += transcript;
                } else {
                  interim += transcript;
                }
              }
              if (finalText.trim()) {
                liveTranscriptHadFinalRef.current = true;
                liveTranscriptRef.current = `${liveTranscriptRef.current} ${finalText}`.trim();
              } else if (!liveTranscriptHadFinalRef.current && interim.trim()) {
                liveTranscriptRef.current = interim.trim();
              }
            } catch {
              // ignore
            }
          };

          recognition.onerror = () => {
            try {
              recognition.stop();
            } catch {
              // ignore
            }
          };

          recognition.onend = () => {
            // keep latest transcript in ref
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        }
      } catch {
        // ignore
      }

      // Escolher explicitamente um mimeType suportado para melhorar compatibilidade em mobile
      let options: MediaRecorderOptions = {};
      try {
        const possibleTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/ogg'
        ];
        for (const t of possibleTypes) {
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
            options = { mimeType: t };
            console.log('[OptimizedChatbot] Usando mimeType para gravação de áudio:', t);
            break;
          }
        }
      } catch (e) {
        console.warn('[OptimizedChatbot] Não foi possível verificar mimeTypes suportados para MediaRecorder', e);
      }

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioState({
          isRecording: false,
          audioBlob,
          audioUrl
        });

        // Parar todas as tracks
        try {
          const s = mediaStreamRef.current;
          if (s) {
            s.getTracks().forEach((t) => t.stop());
          }
        } catch {
          // ignore
        }
        mediaStreamRef.current = null;

        // Tentar usar transcrição local (SpeechRecognition) para resposta imediata
        const localTranscript = String(liveTranscriptRef.current || '').trim();
        if (localTranscript.length > 0) {
          // Adicionar bolha do usuário com o áudio como anexo (mesma UX do fluxo de fallback)
          addCustomMessage('user', '', {
            attachments: [
              {
                type: 'audio',
                url: audioUrl,
                title: 'Áudio enviado',
                mimeType: audioBlob.type || undefined,
              },
            ],
            metadata: { source: 'user_voice' },
          });

          const useStreaming = true;
          await sendMessage(localTranscript, { useStreaming, skipUserMessage: true });
        } else {
          await sendAudioForTranscription(audioBlob);
        }
      };

      mediaRecorder.start();
      setAudioState({ isRecording: true, audioBlob: null, audioUrl: null });
      // Silencioso: botão vermelho pulsando indica gravação
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      setAudioState({ isRecording: false, audioBlob: null, audioUrl: null });

      try {
        const s = mediaStreamRef.current;
        if (s) {
          s.getTracks().forEach((t) => t.stop());
        }
      } catch {
        // ignore
      }
      mediaStreamRef.current = null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const name = String(err?.name || '');
      const msg = String(err?.message || '');
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        toast.error('Microfone bloqueado: permita o acesso ao microfone no navegador.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        toast.error('Nenhum microfone foi encontrado no dispositivo.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        toast.error('Não foi possível iniciar o microfone (pode estar em uso por outro app).');
      } else if (name === 'SecurityError') {
        toast.error('O microfone exige HTTPS (ou localhost).');
      } else {
        toast.error(msg ? `Erro ao acessar o microfone: ${msg}` : 'Erro ao acessar o microfone.');
      }
    }
  }, [sendAudioForTranscription, audioState.isRecording, addCustomMessage, sendMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && audioState.isRecording) {
      mediaRecorderRef.current.stop();
      try {
        const rec = speechRecognitionRef.current;
        if (rec && typeof rec.stop === 'function') {
          rec.stop();
        }
      } catch {
        // ignore
      }
      try {
        const s = mediaStreamRef.current;
        if (s) {
          s.getTracks().forEach((t) => t.stop());
        }
      } catch {
        // ignore
      }
      mediaStreamRef.current = null;
      // Silencioso: áudio será processado automaticamente
    }
  }, [audioState.isRecording]);

  // Handler para análise de imagem
  const handleImageSelected = useCallback((file: File, preview: string | null) => {
    console.log('[OptimizedChatbot] Imagem selecionada para envio:', { file, preview });
    if (preview) {
      setPendingImage({ file, preview });
    }
  }, []);

  // Handler para toggle do chat
  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
    if (onToggle) {
      onToggle();
    }
  }, [isOpen, onToggle]);
  
  // Função para criar novo chat
  const handleNewChat = useCallback(async () => {
    clearMessages();
    setShowHistory(false);
    setIsViewingHistorySession(false); // Permite enviar mensagens novamente
    // Silencioso: UI já limpa visualmente
  }, [clearMessages]);
  
  // Função para carregar histórico
  const loadChatHistory = useCallback(async () => {
    try {
      console.log('[OptimizedChatbot] Carregando histórico de conversas...');
      const response = await chatbotAPI.getSessions();
      console.log('[OptimizedChatbot] Resposta do getSessions:', response);
      
      // Verificar se há conversas
      const sessions = response?.conversations || response?.data || response || [];
      console.log('[OptimizedChatbot] Sessões encontradas:', sessions);
      
      setChatSessions(sessions);
      setShowHistory(true);
      
      // Silencioso: lista de histórico já mostra visualmente
    } catch (error) {
      console.error('[OptimizedChatbot] Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico');
    }
  }, []);
  
  // Função para carregar uma conversa específica
  const loadChat = useCallback(async (selectedChatId: string) => {
    try {
      console.log('[OptimizedChatbot] Carregando conversa:', selectedChatId);
      
      // Usar a nova função do hook para carregar a sessão
      const messages = await loadChatSession(selectedChatId);
      console.log('[OptimizedChatbot] Mensagens carregadas:', messages.length);
      
      setShowHistory(false);
      setIsViewingHistorySession(false);
      // Silencioso: mensagens já aparecem no chat
    } catch (error) {
      console.error('[OptimizedChatbot] Erro ao carregar conversa:', error);
      toast.error('Erro ao carregar conversa');
    }
  }, [loadChatSession]);

  const openDeleteConversationModal = useCallback((targetChatId: string | null, title?: string) => {
    setDeleteConversation({ chatId: targetChatId, title });
  }, []);

  const closeDeleteConversationModal = useCallback(() => {
    if (isDeletingConversation) return;
    setDeleteConversation(null);
  }, [isDeletingConversation]);

  const confirmDeleteConversationModal = useCallback(async () => {
    if (!deleteConversation || isDeletingConversation) return;

    const targetChatId = deleteConversation.chatId;
    const isDeletingCurrentConversation = !targetChatId || targetChatId === chatId;
    setIsDeletingConversation(true);

    try {
      if (isDeletingCurrentConversation) {
        cancelCurrentRequest();
      }

      if (targetChatId) {
        await chatbotAPI.deleteSession(targetChatId);
        setChatSessions((prev) => prev.filter((s) => s.chatId !== targetChatId));
      }

      if (isDeletingCurrentConversation) {
        clearMessages();
        setIsViewingHistorySession(false);
      }

      setDeleteConversation(null);
      // Silencioso: UI já reflete a deleção
    } catch (error) {
      console.error('[OptimizedChatbot] Erro ao deletar conversa:', error);
      toast.error('Erro ao deletar conversa');
    } finally {
      setIsDeletingConversation(false);
    }
  }, [deleteConversation, isDeletingConversation, chatId, cancelCurrentRequest, clearMessages]);


  // Handler para feedback
  const handleFeedback = useCallback((messageId: string) => {
    console.log('Feedback para mensagem:', messageId);
    // TODO: Implementar modal de feedback
  }, []);

  // Converter mensagens para formato Enterprise
  const enterpriseMessages: EnterpriseMessage[] = messages.map(msg => ({
    ...msg,
    metadata: {
      ...msg.metadata,
      // Adicionar campos enterprise se disponíveis
      reasoning: msg.metadata?.reasoning,
      actions: msg.metadata?.actions,
      insights: msg.metadata?.insights,
      confidence: msg.metadata?.confidence,
      complexity: msg.metadata?.complexity,
      personalityAdaptation: msg.metadata?.personalityAdaptation,
      userSophistication: msg.metadata?.userSophistication,
      businessImpact: msg.metadata?.businessImpact,
      automationSuccess: msg.metadata?.automationSuccess,
      roiProjection: msg.metadata?.roiProjection ? {
        timeSaved: `${msg.metadata.roiProjection.value} ${msg.metadata.roiProjection.timeframe}`,
        moneySaved: `R$ ${msg.metadata.roiProjection.value}`,
        decisionsImproved: `${Math.round(msg.metadata.roiProjection.value * 0.1)}`
      } : undefined
    }
  }));

  // Debug: Log das mensagens
  console.log('[OptimizedChatbot] Raw messages from hook:', messages);
  console.log('[OptimizedChatbot] Enterprise messages:', enterpriseMessages);
  console.log('[OptimizedChatbot] Messages length:', enterpriseMessages.length);

  if (!isOpen) {
    return (
      <motion.button
        onClick={handleToggle}
        className="fixed right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        style={{ 
          bottom: typeof window !== 'undefined' && window.innerWidth >= 768 
            ? '24px' 
            : 'calc(env(safe-area-inset-bottom, 0px) + 84px)' 
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <MessageCircle className="w-5 h-5" />
        </motion.div>
      </motion.button>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden ${
          isMobile 
            ? 'inset-0 z-[9999] rounded-none' // Mobile: tela cheia passando por cima de tudo
            : 'inset-x-4 sm:inset-x-auto sm:right-6 w-auto sm:w-[32rem] md:w-[40rem] lg:w-[48rem] xl:w-[52rem] 2xl:w-[56rem] h-[560px] md:h-[640px] lg:h-[720px] xl:h-[760px] 2xl:h-[800px] max-h-[90vh] rounded-2xl z-50'
        }`}
        style={isMobile ? undefined : { bottom: '24px' }}
      >
        {/* Header Enterprise */}
        <div className={`bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 border-b border-gray-200 dark:border-gray-700 p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-green-200 dark:border-green-600 overflow-hidden">
                <Image src={dashboardBranding.assistantAvatarSrc} alt={dashboardBranding.assistantAvatarAlt} width={36} height={36} className="object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">{dashboardBranding.assistantLabel}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span>{connectionStatus === 'connected' ? 'Online' : 
                         connectionStatus === 'connecting' ? 'Online' : 'Offline'}</span>
                  {isStreaming && <span className="text-blue-500">• Streaming</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Botão Novo Chat */}
              <motion.button
                onClick={handleNewChat}
                className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-lg"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-semibold">Novo</span>
                {/* Tooltip desktop */}
                {!isMobile && (
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    Nova conversa
                  </span>
                )}
              </motion.button>
              
              {/* Botão Histórico */}
              <motion.button
                onClick={loadChatHistory}
                className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  showHistory
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                }`}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Clock className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-semibold">Histórico</span>
                {/* Tooltip desktop */}
                {!isMobile && (
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    Ver histórico
                  </span>
                )}
              </motion.button>
              
              {/* Botão Limpar */}
              {hasMessages && (
                <motion.button
                  onClick={() => openDeleteConversationModal(chatId)}
                  className="group relative flex items-center justify-center w-10 h-10 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="w-4 h-4" />
                  {/* Tooltip */}
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    Limpar chat
                  </span>
                </motion.button>
              )}
              
              {/* Botão Fechar */}
              <motion.button
                onClick={handleToggle}
                className="group relative flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-300 ml-1"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
                {/* Tooltip */}
                {!isMobile && (
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    Minimizar
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
          {enterpriseMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mx-auto mb-4 border-2 border-green-200 dark:border-green-600 shadow-lg overflow-hidden">
                <Image src={dashboardBranding.assistantAvatarSrc} alt={dashboardBranding.assistantAvatarAlt} width={64} height={64} className="object-contain" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-green-800 dark:text-green-200">{dashboardBranding.assistantGreeting}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Seu assistente inteligente para gestão pecuária.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">📊 Análises</span>
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">🐄 Rebanho</span>
                <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">💰 Vendas</span>
              </div>
            </div>
          ) : (
            <>
              <ActionProgressStatus actionStatus={actionStatus} />
              
              {enterpriseMessages.map((message, index) => {
                console.log(`[OptimizedChatbot] Rendering message ${index}:`, message);
                const showBusinessData = (() => {
                  if (mode !== 'business') return false;
                  if (message.sender === 'user') return false;
                  if (!message.metadata?.businessData) return false;

                  let lastUserText = '';
                  for (let i = index - 1; i >= 0; i--) {
                    const prev = enterpriseMessages[i];
                    if (prev.sender === 'user') {
                      lastUserText = typeof prev.content === 'string' ? prev.content : '';
                      break;
                    }
                  }

                  if (!lastUserText) return false;

                  const requestPattern = /(graf|chart|dashboard|visualiz|indicador|m[eé]tric|kpi|fluxo de caixa|dre)/i;
                  const noChartsPattern = /(sem|nao|não).*(graf|chart|dashboard|visualiz|indicador|m[eé]tric|kpi)/i;
                  return requestPattern.test(lastUserText) && !noChartsPattern.test(lastUserText);
                })();
                return (
                  <EnterpriseMessageBubble
                    key={message.id}
                    message={message}
                    theme={theme}
                    onFeedback={handleFeedback}
                    avatarUrl={undefined}
                    showBusinessData={showBusinessData}
                  />
                );
              })}
            </>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4"
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                <button
                  onClick={retryLastMessage}
                  className="ml-auto text-xs text-red-600 hover:text-red-800 underline"
                >
                  Tentar novamente
                </button>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {/* Banner de confirmação de ação pendente */}
          {(() => {
            console.log('[OptimizedChatbot] Checking pendingAction:', pendingAction);
            console.log('[OptimizedChatbot] Should show banner:', pendingAction && !pendingAction.executed && !pendingAction.autoExecute);
            return pendingAction && !pendingAction.executed && !pendingAction.autoExecute;
          })() && (
            <div className="mb-3 p-3 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600" />
                Confirma executar a ação detectada?
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 break-words">
                {pendingAction?.action?.replace('create_', '').replace('_', ' ')} — {String((pendingAction?.payload as Record<string, unknown>)?.descricao || 'Nova transação')} de R$ {String((pendingAction?.payload as Record<string, unknown>)?.valor || '0')}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => sendMessage('sim', { useStreaming: true })}
                  className={`px-3 py-1 text-xs rounded ${theme.button} text-white`}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => clearPendingAction()}
                  className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div
            className={`flex items-end gap-2 px-3 py-2 rounded-xl ${theme.inputBg} border border-gray-200/60 dark:border-gray-600`}
          >
            {/* Botão "+" estilo Claude */}
            <ClaudeStyleMediaUpload
              onImageSelected={handleImageSelected}
              disabled={isLoading || isStreaming || showHistory || isViewingHistorySession}
              className="flex-shrink-0"
            />
            
            <div className="flex-1 relative">
              {/* Preview pequeno da imagem anexada, estilo GPT */}
              {pendingImage && (
                <div className="absolute -top-14 left-0 flex items-center gap-2 mb-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <Image src={pendingImage.preview} alt="Preview da imagem" fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingImage(null)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remover
                  </button>
                </div>
              )}
              <textarea
                ref={(el) => {
                  if (el) {
                    // Auto-resize do textarea
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                  }
                }}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Auto-resize em tempo real
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={(e) => {
                  // Alt+Enter = nova linha, Enter = enviar
                  if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  } else if (e.key === 'Enter' && e.altKey) {
                    // Alt+Enter = nova linha
                    e.preventDefault();
                    const cursorPos = e.currentTarget.selectionStart;
                    const newValue = inputValue.slice(0, cursorPos) + '\n' + inputValue.slice(cursorPos);
                    setInputValue(newValue);
                    
                    // Atualizar cursor para depois da nova linha
                    setTimeout(() => {
                      e.currentTarget.setSelectionRange(cursorPos + 1, cursorPos + 1);
                    }, 0);
                  }
                }}
                placeholder={
                  showHistory || isViewingHistorySession
                    ? 'Clique em "+" para iniciar nova conversa'
                    : 'Pergunte sobre seu rebanho, vendas, metas...'
                }
                className={`w-full px-3 py-2 rounded-lg bg-transparent focus:outline-none focus:ring-0 text-sm resize-none overflow-hidden min-h-[40px] max-h-[120px] ${
                  (showHistory || isViewingHistorySession) ? 'cursor-not-allowed opacity-60' : ''
                }`}
                disabled={isLoading || showHistory || isViewingHistorySession}
                rows={1}
                style={{ 
                  minHeight: '40px',
                  maxHeight: '120px',
                  lineHeight: '1.5'
                }}
              />
              
            </div>
            
            {/* Botão de Microfone */}
            {!audioState.isRecording ? (
              <motion.button
                onClick={startRecording}
                disabled={isLoading || isStreaming || showHistory || isViewingHistorySession}
                className="p-2.5 rounded-lg bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Gravar áudio"
              >
                <Mic className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </motion.button>
            ) : (
              <motion.button
                onClick={stopRecording}
                className="p-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Parar gravação"
              >
                <Square className="w-5 h-5" />
              </motion.button>
            )}
            
            {/* Botão Send */}
            {isLoading || isStreaming ? (
              <button
                onClick={cancelCurrentRequest}
                className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                title="Cancelar"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={(!inputValue.trim() && !pendingImage) || showHistory || isViewingHistorySession}
                className={`p-2.5 ${theme.button} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
                title={showHistory || isViewingHistorySession ? 'Inicie nova conversa para enviar' : 'Enviar (Enter)'}
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {isPremiumUser && (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  {theme.name}
                </span>
              )}
              
              {isStreaming && (
                <span className="flex items-center gap-1 text-blue-500">
                  <Zap className="w-4 h-4" />
                  Streaming ativo
                </span>
              )}
            </div>
            
            <span>{enterpriseMessages.length} mensagens</span>
          </div>
        </div>
      </motion.div>

      {deleteConversation && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeDeleteConversationModal}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {deleteConversation.chatId ? 'Deletar Conversa' : 'Limpar Chat'}
              </h2>
              <button
                onClick={closeDeleteConversationModal}
                disabled={isDeletingConversation}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                  <polyline points="3,6 5,6 21,6" />
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              
              {/* Message */}
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Tem certeza?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {deleteConversation.chatId
                    ? 'Você está prestes a deletar esta conversa'
                    : 'Você está prestes a limpar este chat'}
                  {deleteConversation.title && (
                    <><br /><strong className="text-gray-800 dark:text-gray-200">{deleteConversation.title}</strong></>
                  )}
                  . Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteConversationModal}
                disabled={isDeletingConversation}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteConversationModal}
                disabled={isDeletingConversation}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeletingConversation ? (
                  'Deletando…'
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                    </svg>
                    Deletar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Correção de Dados */}
      <DataCorrectionModal
        isOpen={dataCorrectionModal?.isOpen || false}
        onCloseAction={closeDataCorrectionModal}
        correctionData={dataCorrectionModal?.data || null}
        onConfirmAction={() => {
          // Silencioso: modal fecha e dados são atualizados
          closeDataCorrectionModal();
        }}
      />

    </>
  );
}
