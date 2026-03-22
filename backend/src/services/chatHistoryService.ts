import { ChatMessage, IChatMessage } from '../models/ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import { AI_BRAND } from '../config/aiPrompts';

// Interfaces para compatibilidade
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

export interface Conversation {
  chatId: string;
  messages: Array<{
    chatId: string;
    sender: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: any;
    expiresAt?: string;
    isImportant: boolean;
    userId: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  isActive: boolean;
  lastActivity?: Date;
}

export interface ChatMessageInput {
  chatId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId: string;
  metadata?: any;
}

export class ChatHistoryService {
  // Calcular data de expiração baseada no tipo de mensagem
  private calculateExpirationDate(messageType: string, isImportant: boolean = false): string {
    const now = new Date();
    
    if (isImportant) {
      // Mensagens importantes duram 30 dias
      now.setDate(now.getDate() + 30);
      return now.toISOString();
    }
    
    switch (messageType) {
      case 'premium':
        // Análises premium duram 7 dias
        now.setDate(now.getDate() + 7);
        break;
      case 'analysis':
        // Análises duram 7 dias
        now.setDate(now.getDate() + 7);
        break;
      case 'guidance':
        // Orientações da plataforma duram 3 dias
        now.setDate(now.getDate() + 3);
        break;
      case 'basic':
      default:
        // Mensagens básicas duram 24 horas
        now.setHours(now.getHours() + 24);
        break;
    }
    
    return now.toISOString();
  }

  async getConversation(chatId: string, userId?: string): Promise<Conversation> {
    try {
      const messages = await ChatMessage.findByChatId(chatId, 100, userId);

      if (messages.length === 0) {
        throw new Error('Conversa expirada ou não encontrada');
      }

      return {
        chatId,
        messages: messages.map(msg => ({
          chatId: msg.chat_id,
          sender: msg.sender,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          metadata: msg.metadata,
          expiresAt: msg.expires_at,
          isImportant: msg.is_important,
          userId: msg.user_id
        })),
        createdAt: new Date(messages[0]?.created_at || new Date()),
        updatedAt: new Date(messages[messages.length - 1]?.updated_at || new Date()),
        userId: messages[0]?.user_id,
        isActive: true,
        lastActivity: new Date(messages[messages.length - 1]?.timestamp || new Date())
      };
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  async startNewConversation(userId: string): Promise<Conversation> {
    try {
      const chatId = uuidv4();

      const welcomeMessageData = {
        chat_id: chatId,
        user_id: userId,
        sender: 'assistant' as const,
        content: AI_BRAND.welcomeMessage,
        timestamp: new Date().toISOString(),
        metadata: {
          message_type: 'basic' as const,
          is_important: false
        },
        expires_at: this.calculateExpirationDate('basic'),
        is_important: false
      };

      const welcomeMessage = await ChatMessage.create(welcomeMessageData);

      return {
        chatId,
        messages: [{
          chatId,
          sender: 'assistant',
          content: AI_BRAND.welcomeMessage,
          timestamp: new Date(),
          metadata: {
            messageType: 'basic',
            isImportant: false
          },
          expiresAt: this.calculateExpirationDate('basic'),
          isImportant: false,
          userId
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        isActive: true,
        lastActivity: new Date()
      };
    } catch (error) {
      console.error('Error starting new conversation:', error);
      throw error;
    }
  }

  async createConversation(userId: string): Promise<Conversation> {
    try {
      const chatId = uuidv4();

      const welcomeMessageData = {
        chat_id: chatId,
        user_id: userId,
        sender: 'assistant' as const,
        content: AI_BRAND.welcomeMessage,
        timestamp: new Date().toISOString(),
        metadata: {
          message_type: 'basic' as const,
          is_important: false
        },
        expires_at: this.calculateExpirationDate('basic'),
        is_important: false
      };

      await ChatMessage.create(welcomeMessageData);

      return {
        chatId,
        messages: [{
          chatId,
          sender: 'assistant',
          content: AI_BRAND.welcomeMessage,
          timestamp: new Date(),
          metadata: {
            messageType: 'basic',
            isImportant: false
          },
          expiresAt: this.calculateExpirationDate('basic'),
          isImportant: false,
          userId
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        isActive: true,
        lastActivity: new Date()
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async addMessage(message: ChatMessageInput): Promise<void> {
    try {
      const messageType = message.metadata?.messageType || 'basic';
      const isImportant = message.metadata?.isImportant || false;

      const messageData = {
        chat_id: message.chatId,
        user_id: message.userId,
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        metadata: {
          ...message.metadata,
          message_type: messageType as 'basic' | 'premium' | 'analysis' | 'guidance' | 'streaming',
          is_important: isImportant
        },
        expires_at: this.calculateExpirationDate(messageType, isImportant),
        is_important: isImportant
      };

      await ChatMessage.create(messageData);
      
      // Atualizar analytics do usuário
      await this.updateUserAnalytics(message.userId, messageType);
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  async getSessions(userId: string): Promise<ChatSession[]> {
    try {
      // Buscar mensagens do usuário com limite para performance
      const messages = await ChatMessage.findByUserId(userId, 500);

      // Agrupar por chatId manualmente
      const sessionsMap = new Map();
      messages.forEach(msg => {
        if (!sessionsMap.has(msg.chat_id)) {
          // Criar nova sessão
          const title = msg.content.length > 30 ? msg.content.substring(0, 30) + '...' 
            : msg.content;
          sessionsMap.set(msg.chat_id, {
            chatId: msg.chat_id,
            title: title,
            createdAt: msg.created_at,
            updatedAt: msg.updated_at,
            messageCount: 1
          });
        } else {
          // Atualizar sessão existente
          const session = sessionsMap.get(msg.chat_id);
          session.messageCount++;
          // Atualizar título e data se for mais recente
          if (new Date(msg.updated_at!) > new Date(session.updatedAt)) {
            session.updatedAt = msg.updated_at;
            session.title = msg.content.length > 30 
              ? msg.content.substring(0, 30) + '...' 
              : msg.content;
          }
        }
      });

      // Converter para array e ordenar por data mais recente
      const sessions = Array.from(sessionsMap.values());
      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return sessions.map(session => ({
        chatId: session.chatId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        userId,
        isActive: true,
        lastActivity: session.updatedAt,
        messageCount: session.messageCount
      }));
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }

  async markMessageAsImportant(chatId: string, messageId: string, userId: string): Promise<void> {
    try {
      await ChatMessage.markAsImportant(messageId, userId);
    } catch (error) {
      console.error('Error marking message as important:', error);
      throw error;
    }
  }

  async updateUserAnalytics(userId: string, messageType: string): Promise<void> {
    try {
      // Aqui você pode implementar lógica para atualizar analytics do usuário
      // Por exemplo, contar mensagens, calcular tempo médio de resposta, etc.
      console.log(`Atualizando analytics para usuário ${userId}, tipo: ${messageType}`);
    } catch (error) {
      console.error('Error updating user analytics:', error);
    }
  }

  async cleanupExpiredMessages(): Promise<number> {
    try {
      const count = await ChatMessage.cleanupExpired();
      console.log(`${count} mensagens expiradas foram removidas`);
      return count;
    } catch (error) {
      console.error('Error cleaning up expired messages:', error);
      return 0;
    }
  }

  async deleteConversation(chatId: string, userId?: string): Promise<number> {
    try {
      console.log(`Excluindo conversa: ${chatId}`);
      const count = await ChatMessage.deleteByChatId(chatId, userId);
      console.log(`Conversa ${chatId} excluída com sucesso (${count} mensagens removidas)`);
      return count;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async deleteAllUserConversations(userId: string): Promise<number> {
    try {
      console.log(`Excluindo todas as conversas do usuário: ${userId}`);
      const count = await ChatMessage.deleteByUserId(userId);
      console.log(`Todas as conversas do usuário excluídas (${count} mensagens removidas)`);
      return count;
    } catch (error) {
      console.error('Error deleting all user conversations:', error);
      throw error;
    }
  }
}

export default ChatHistoryService;
