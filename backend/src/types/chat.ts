// ===== TIPOS PARA SISTEMA DE CHAT BOVINEXT =====

export interface ChatMessage {
  chatId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId: string;
  metadata?: {
  analysisData?: any;
  processingTime?: number;
  error?: boolean;
  errorMessage?: string;
  expertise?: string;
  confidence?: number;
  isImportant?: boolean;
  messageType?: 'basic' | 'premium' | 'analysis' | 'guidance' | 'streaming';
    intent?: string;
    entities?: Record<string, unknown>;
    isStreaming?: boolean;
    isComplete?: boolean;
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
  };
  expiresAt?: Date;
  isImportant: boolean;
}

export interface Conversation {
  chatId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  isActive: boolean;
  lastActivity?: Date;
}

export interface ChatSession {
  chatId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isActive: boolean;
  lastActivity: string;
  messageCount: number;
}

export interface ChatAnalytics {
  totalMessages: number;
  averageResponseTime: number;
  userSatisfaction: number;
  mostUsedFeatures: string[];
  peakUsageHours: number[];
} 