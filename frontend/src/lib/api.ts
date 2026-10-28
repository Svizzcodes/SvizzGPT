import { Conversation, Message, UserSettings, UsageMetrics, Attachment } from './types';

const API_BASE = '/api';

export const api = {
  // Health & Key Check
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Conversations
  async getConversations(): Promise<{ conversations: Conversation[] }> {
    const res = await fetch(`${API_BASE}/conversations`);
    return res.json();
  },

  async createConversation(title?: string, model?: string): Promise<{ success: boolean; conversation: Conversation }> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, model })
    });
    return res.json();
  },

  async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    if (!res.ok) throw new Error('Conversation not found');
    return res.json();
  },

  async updateConversation(id: string, data: Partial<Conversation>) {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteConversation(id: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async deleteAllConversations() {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Message Actions
  async updateMessage(id: string, data: Partial<Message>) {
    const res = await fetch(`${API_BASE}/conversations/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteMessage(id: string) {
    const res = await fetch(`${API_BASE}/conversations/messages/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // File Upload
  async uploadFile(file: File): Promise<{
    success: boolean;
    filename: string;
    file_type: 'image' | 'document' | 'code' | 'data' | 'other';
    mime_type: string;
    file_size: number;
    extracted_text?: string;
    data_url?: string;
    url: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  // Image Generation
  async generateImage(prompt: string, conversation_id?: string, model?: string) {
    const res = await fetch(`${API_BASE}/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, conversation_id, model })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Image generation failed');
    }
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ settings: UserSettings }> {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; settings: UserSettings }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Usage Metrics
  async getUsage(): Promise<UsageMetrics> {
    const res = await fetch(`${API_BASE}/usage`);
    return res.json();
  }
};
