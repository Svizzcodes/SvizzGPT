import { ModelOption, ThemeName, WallpaperMode } from './types';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'qwen/qwen3.8-27b',
    name: 'SVIZZ-ULTRA (GROQ)',
    tag: 'ULTRA FAST // ACTIVE',
    description: 'High-speed reasoning engine running on Groq LPU hardware.',
    is_vision: false
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'SVIZZ-DEEP (GROQ)',
    tag: 'DEEP LOGIC',
    description: '120B parameter reasoning model on Groq architecture.',
    is_vision: false
  },
  {
    id: 'gpt-4o',
    name: 'SVIZZ-OMNI (OPENAI)',
    tag: 'VISION + MULTIMODAL',
    description: 'Flagship multimodal reasoning with image understanding and DALL-E 3.',
    is_vision: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'SVIZZ-FLASH (OPENAI)',
    tag: 'LIGHTWEIGHT',
    description: 'Lightweight OpenAI model optimized for quick queries.',
    is_vision: true
  },
  {
    id: 'gemini-1.5-flash',
    name: 'SVIZZ-GEMINI',
    tag: 'GOOGLE AI',
    description: 'Long-context multimodal model from Google.',
    is_vision: true
  }
];

export const THEME_PRESETS: Array<{ id: ThemeName; name: string; hex: string; desc: string }> = [
  { id: 'mono', name: 'MONO VOID', hex: '#ffffff', desc: 'Stark monochrome brutalism' },
  { id: 'amber', name: 'CRT AMBER', hex: '#f59e0b', desc: 'Phosphor warm terminal amber' },
  { id: 'cyan', name: 'CYBER CYAN', hex: '#06b6d4', desc: 'Electric digital cyan' },
  { id: 'emerald', name: 'MATRIX GREEN', hex: '#10b981', desc: 'Classic phosphor emerald' },
  { id: 'crimson', name: 'BRUTAL RED', hex: '#ef4444', desc: 'Deep high-contrast blood red' },
  { id: 'violet', name: 'HYPER VIOLET', hex: '#a855f7', desc: 'Futuristic ultraviolet' },
  { id: 'acid', name: 'TOXIC ACID', hex: '#a3e635', desc: 'Sharp neon acid green' },
];

export const WALLPAPER_MODES: Array<{ id: WallpaperMode; name: string; desc: string }> = [
  { id: 'grid', name: 'ASCII GRID', desc: 'Geometric matrix coordinate grid' },
  { id: 'particles', name: 'PARTICLE CLOUD', desc: 'Drifting interactive ASCII point constellation' },
  { id: 'rain', name: 'DIGITAL STREAM', desc: 'Cascading terminal character rain' },
  { id: 'topographic', name: 'TOPOGRAPHIC SINE', desc: 'Mathematical contour elevation waves' },
  { id: 'signal', name: 'SIGNAL FREQUENCY', desc: 'Oscillating ASCII audio waveform' },
  { id: 'noise', name: 'DITHER NOISE', desc: 'Controlled stochastic digital grain' },
  { id: 'void', name: 'DEEP VOID', desc: 'Clean pitch black minimal backdrop' },
];

export const SVIZZ_ASCII_LOGO = `
 ███████╗██╗   ██╗██╗███████╗███████╗ ██████╗ ██████╗ ████████╗
 ██╔════╝██║   ██║██║╚══███╔╝╚══███╔╝██╔════╝ ██╔══██╗╚══██╔══╝
 ███████╗██║   ██║██║  ███╔╝   ███╔╝ ██║  ███╗██████╔╝   ██║   
 ╚════██║╚██╗ ██╔╝██║ ███╔╝   ███╔╝  ██║   ██║██╔═══╝    ██║   
 ███████║ ╚████╔╝ ██║███████╗███████╗╚██████╔╝██║        ██║   
 ╚══════╝  ╚═══╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝        ╚═╝   
`;

export const SVIZZ_COMPACT_ASCII = `
[ S V I Z Z // G P T ]
:: MULTIMODAL INTELLIGENCE ENGINE ::
`;

export const EMPTY_PROMPT_SUGGESTIONS = [
  {
    title: "CODE ARCHITECTURE",
    prompt: "Design a high-concurrency event-driven architecture in TypeScript with clean interfaces and type safety.",
    category: "code"
  },
  {
    title: "MATHEMATICAL REASONING",
    prompt: "Explain the mathematics behind Transformer Self-Attention with LaTeX equations ($...$) and matrix diagrams.",
    category: "math"
  },
  {
    title: "SYSTEM DEBUGGING",
    prompt: "Write a complete memory-efficient async worker queue in Python with retry policies and backoff.",
    category: "code"
  },
  {
    title: "IMAGE GENERATION",
    prompt: "/image An ASCII-inspired brutalist cyberpunk interface with glowing amber wireframes and typography",
    category: "image"
  }
];
