import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Palette, Wallpaper, Settings, Trash2, 
  Sparkles, Terminal, Globe, Maximize2, X, Command 
} from 'lucide-react';
import { ThemeName, WallpaperMode } from '../../lib/types';
import { THEME_PRESETS, WALLPAPER_MODES, AVAILABLE_MODELS } from '../../lib/constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenUsage: () => void;
  onSetTheme: (theme: ThemeName) => void;
  onSetWallpaper: (mode: WallpaperMode) => void;
  onSetModel: (model: string) => void;
  onClearAll: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onOpenSettings,
  onOpenUsage,
  onSetTheme,
  onSetWallpaper,
  onSetModel,
  onClearAll
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'new_chat',
      title: 'New Conversation',
      subtitle: 'Start a fresh conversation thread',
      icon: <Plus className="w-4 h-4 text-svizz-accent" />,
      action: () => { onNewChat(); onClose(); }
    },
    {
      id: 'settings',
      title: 'Open Settings',
      subtitle: 'Customize appearance, AI defaults, and data',
      icon: <Settings className="w-4 h-4 text-svizz-accent" />,
      action: () => { onOpenSettings(); onClose(); }
    },
    {
      id: 'usage',
      title: 'View Token & Cost Metrics',
      subtitle: 'Inspect API requests and estimated costs',
      icon: <Sparkles className="w-4 h-4 text-svizz-accent" />,
      action: () => { onOpenUsage(); onClose(); }
    },
    // Models
    ...AVAILABLE_MODELS.map(m => ({
      id: `model_${m.id}`,
      title: `Switch Model: ${m.name}`,
      subtitle: m.description,
      icon: <Terminal className="w-4 h-4 text-svizz-accent" />,
      action: () => { onSetModel(m.id); onClose(); }
    })),
    // Themes
    ...THEME_PRESETS.map(t => ({
      id: `theme_${t.id}`,
      title: `Theme: ${t.name}`,
      subtitle: t.desc,
      icon: (
        <span 
          className="w-3.5 h-3.5 rounded-full inline-block border border-svizz-border"
          style={{ backgroundColor: t.hex }}
        />
      ),
      action: () => { onSetTheme(t.id); onClose(); }
    })),
    // Wallpapers
    ...WALLPAPER_MODES.map(w => ({
      id: `wallpaper_${w.id}`,
      title: `ASCII Wallpaper: ${w.name}`,
      subtitle: w.desc,
      icon: <Wallpaper className="w-4 h-4 text-svizz-accent" />,
      action: () => { onSetWallpaper(w.id); onClose(); }
    })),
    {
      id: 'clear_all',
      title: 'Clear All Conversations',
      subtitle: 'Permanently delete all conversation history',
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
      action: () => { onClearAll(); onClose(); }
    }
  ];

  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-[9990] flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-svizz-accent/80 shadow-[0_0_50px_var(--svizz-glow)] overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-2 p-3 border-b border-svizz-border bg-black">
          <Command className="w-4 h-4 text-svizz-accent" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search themes, models, wallpapers..."
            className="w-full bg-transparent text-svizz-text placeholder-zinc-500 text-sm focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-svizz-muted hover:text-svizz-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              [NO MATCHING COMMANDS]
            </div>
          ) : (
            filtered.map(cmd => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center justify-between p-2.5 hover:bg-zinc-900 border border-transparent hover:border-svizz-border text-left group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-black border border-svizz-border group-hover:border-svizz-accent">
                    {cmd.icon}
                  </div>
                  <div>
                    <div className="text-xs text-svizz-text font-bold group-hover:text-svizz-accent">
                      {cmd.title}
                    </div>
                    <div className="text-[10px] text-svizz-muted">
                      {cmd.subtitle}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-600 group-hover:text-svizz-accent uppercase font-mono">
                  [SELECT]
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-svizz-border bg-black/60 flex items-center justify-between text-[10px] text-svizz-muted">
          <span>NAVIGATION: ↑ ↓ TO MOVE</span>
          <span>SELECT: ENTER</span>
          <span>DISMISS: ESC</span>
        </div>
      </div>
    </div>
  );
};
