export type Role = 'user' | 'assistant' | 'system';

export type ThemeName = 'mono' | 'amber' | 'cyan' | 'emerald' | 'crimson' | 'violet' | 'acid';

export type WallpaperMode = 
  | 'grid' 
  | 'particles' 
  | 'rain' 
  | 'topographic' 
  | 'signal' 
  | 'noise' 
  | 'void';

export interface Attachment {
  id?: string;
  filename: string;
  file_type: 'image' | 'document' | 'code' | 'data' | 'other';
  mime_type: string;
  file_size: number;
  url?: string;
  data_url?: string;
  extracted_text?: string;
}

export interface Citation {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface Message {
  id: string;
  conversation_id?: string;
  role: Role;
  content: string;
  model?: string;
  status?: 'streaming' | 'completed' | 'error';
  error_message?: string;
  is_focused?: boolean;
  is_liked?: boolean | null;
  created_at: string;
  attachments?: Attachment[];
  metadata?: {
    citations?: Citation[];
    latency_ms?: number;
    tokens?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  is_pinned: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  theme: ThemeName;
  ascii_wallpaper: WallpaperMode;
  ascii_intensity: number;
  ascii_speed: number;
  crt_effect: boolean;
  scanline_effect: boolean;
  pixel_noise: boolean;
  reduced_motion: boolean;
  default_model: string;
  web_search_enabled: boolean;
  enter_to_send: boolean;
  stream_responses: boolean;
  system_instructions?: string;
}

export interface UsageSummary {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_estimated_cost_usd: number;
}

export interface UsageMetrics {
  summary: UsageSummary;
  model_breakdown: Record<string, {
    requests: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost: number;
  }>;
  recent_logs: Array<{
    id: string;
    model: string;
    action: string;
    input_tokens: number;
    output_tokens: number;
    cost: number;
    timestamp: string;
  }>;
}

export interface ModelOption {
  id: string;
  name: string;
  tag: string;
  description: string;
  is_vision: boolean;
}
