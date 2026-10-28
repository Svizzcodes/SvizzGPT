import React from 'react';
import { Menu, Terminal, Command, Palette, Maximize, Minimize, Sparkles } from 'lucide-react';
import { ThemeName } from '../../lib/types';
import { THEME_PRESETS } from '../../lib/constants';

interface HeaderProps {
  conversationTitle?: string;
  selectedModel: string;
  currentTheme: ThemeName;
  onCycleTheme: () => void;
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
  isDistractionFree: boolean;
  onToggleDistractionFree: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  conversationTitle = 'NEW CONVERSATION',
  selectedModel,
  currentTheme,
  onCycleTheme,
  onOpenCommandPalette,
  onToggleSidebar,
  isDistractionFree,
  onToggleDistractionFree
}) => {
  const currentThemePreset = THEME_PRESETS.find(t => t.id === currentTheme) || THEME_PRESETS[0];

  return (
    <header className="h-12 border-b border-svizz-border bg-black/60 backdrop-blur-md flex items-center justify-between px-4 z-20 select-none font-mono text-xs">
      {/* Left section: Sidebar toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 border border-svizz-border hover:border-svizz-accent hover:text-svizz-accent transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-svizz-accent text-[11px] hidden sm:inline">
            SVIZZ//
          </span>
          <span className="text-zinc-400 truncate max-w-[180px] sm:max-w-xs font-sans text-xs">
            {conversationTitle}
          </span>
        </div>
      </div>

      {/* Right Section: System stats, Command palette, Theme switcher */}
      <div className="flex items-center gap-2">
        {/* Command Palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-zinc-950 border border-svizz-border hover:border-svizz-accent text-[10px] text-svizz-muted hover:text-svizz-text transition-colors"
          title="Command Palette (Cmd+K)"
        >
          <Command className="w-3 h-3 text-svizz-accent" />
          <span>COMMANDS</span>
          <kbd className="px-1 py-0.2 bg-black border border-svizz-border text-[9px]">⌘K</kbd>
        </button>

        {/* Theme quick cycle button */}
        <button
          onClick={onCycleTheme}
          className="flex items-center gap-1 px-2 py-1 border border-svizz-border hover:border-svizz-accent transition-colors text-[10px]"
          title={`Theme: ${currentThemePreset.name} (Click to cycle)`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full border border-black inline-block"
            style={{ backgroundColor: currentThemePreset.hex }}
          />
          <span className="hidden md:inline uppercase text-svizz-text">{currentThemePreset.name.split(' ')[0]}</span>
        </button>

        {/* Distraction free / Zen Mode */}
        <button
          onClick={onToggleDistractionFree}
          className={`p-1.5 border transition-colors ${
            isDistractionFree 
              ? 'border-svizz-accent text-svizz-accent bg-svizz-accent-muted' 
              : 'border-svizz-border text-svizz-muted hover:text-svizz-text hover:border-svizz-accent'
          }`}
          title={isDistractionFree ? "Exit Zen Mode" : "Zen Mode"}
        >
          {isDistractionFree ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
