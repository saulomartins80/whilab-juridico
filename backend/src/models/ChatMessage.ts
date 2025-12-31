import supabase from '../config/supabase';

export interface IChatMessage {
  id?: string;
  chat_id: string;
  user_id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    analysis_data?: any;
    processing_time?: number;
    error?: boolean;
    error_message?: string;
    expertise?: string;
    confidence?: number;
    is_important?: boolean;
    message_type?: 'basic' | 'premium' | 'analysis' | 'guidance' | 'streaming';
    intent?: string;
    entities?: Record<string, unknown>;
    is_streaming?: boolean;
    is_complete?: boolean;
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
      user_sophistication?: number;
      business_impact?: number;
      roi_projection?: {
        time_saved: string;
        money_saved: string;
        decisions_improved: string;
      };
      competitive_advantage?: string[];
    };
    requires_confirmation?: boolean;
    action_data?: {
      type: string;
      entities: Record<string, unknown>;
      user_id: string;
    };
    recommendations?: Array<{
      title: string;
      action?: string;
      description?: string;
    }>;
    next_steps?: string[];
    follow_up_questions?: string[];
  };
  expires_at?: string;
  is_important: boolean;
  created_at?: string;
  updated_at?: string;
}

export class ChatMessage {
  static async create(messageData: Omit<IChatMessage, 'id' | 'created_at' | 'updated_at'>): Promise<IChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        ...messageData,
        timestamp: messageData.timestamp || new Date().toISOString(),
        is_important: messageData.is_important || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }

    return data;
  }

  static async findByChatId(chatId: string, limit: number = 100, userId?: string): Promise<IChatMessage[]> {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId) as any;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }

    return data || [];
  }

  static async findByUserId(userId: string, limit: number = 500): Promise<IChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user messages:', error);
      throw error;
    }

    return data || [];
  }

  static async deleteByUserId(userId: string): Promise<number> {
    const { error, count } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user messages:', error);
      throw error;
    }

    return count || 0;
  }

  static async deleteByChatId(chatId: string, userId?: string): Promise<number> {
    let query = supabase
      .from('chat_messages')
      .delete()
      .eq('chat_id', chatId);

    if (userId) {
      query = query.eq('user_id', userId) as any;
    }

    const { error, count } = await query;

    if (error) {
      console.error('Error deleting chat messages:', error);
      throw error;
    }

    return count || 0;
  }

  static async markAsImportant(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .update({ 
        is_important: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      })
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking message as important:', error);
      throw error;
    }
  }

  static async cleanupExpired(): Promise<number> {
    const { error, count } = await supabase
      .from('chat_messages')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up expired messages:', error);
      throw error;
    }

    return count || 0;
  }
}

export default ChatMessage;
