import React, { useState } from 'react';
import { 
  Folder, HardDrive, Cpu, Settings, Share2, MessageSquare, 
  Sparkles, ChevronDown, Check, Sun, Moon, Eye, Command 
} from 'lucide-react';

interface ColabHeaderProps {
  notebookTitle: string;
  onUpdateTitle: (title: string) => void;
  onNewNotebook: () => void;
  onOpenSettings: () => void;
  onOpenUsage: () => void;
  onOpenCommandPalette: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const ColabHeader: React.FC<ColabHeaderProps> = ({
  notebookTitle,
  onUpdateTitle,
  onNewNotebook,
  onOpenSettings,
  onOpenUsage,
  onOpenCommandPalette,
  isDarkTheme,
  onToggleTheme,
  selectedModel,
  onSelectModel
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(notebookTitle);

  const menus = [
    {
      name: 'File',
      items: [
        { label: 'New notebook', action: onNewNotebook, shortcut: '⌘N' },
        { label: 'Open settings', action: onOpenSettings },
        { label: 'Command palette', action: onOpenCommandPalette, shortcut: '⌘K' },
      ]
    },
    {
      name: 'Edit',
      items: [
        { label: 'Clear all outputs', action: () => window.location.reload() },
        { label: 'Toggle theme', action: onToggleTheme },
      ]
    },
    {
      name: 'View',
      items: [
        { label: 'Toggle dark / light mode', action: onToggleTheme },
        { label: 'Command palette', action: onOpenCommandPalette, shortcut: '⌘K' },
      ]
    },
    {
      name: 'Runtime',
      items: [
        { label: 'Restart runtime & clear outputs', action: () => window.location.reload() },
        { label: 'View telemetry & LPU usage', action: onOpenUsage },
      ]
    },
    {
      name: 'Tools',
      items: [
        { label: 'Settings', action: onOpenSettings },
        { label: 'Usage & Token Tracker', action: onOpenUsage },
      ]
    },
    {
      name: 'Help',
      items: [
        { label: 'About Colab / SvizzGPT', action: onOpenSettings },
      ]
    }
  ];

  return (
    <header className="bg-[var(--colab-surface)] border-b border-[var(--colab-border)] text-[var(--colab-text)] select-none z-30 relative font-sans text-xs">
      {/* Top Row: Logo, Title, Resource Monitor, Connect */}
      <div className="h-10 px-3 flex items-center justify-between">
        {/* Left: Colab Logo & Title */}
        <div className="flex items-center gap-2.5">
          {/* Authentic Google Colab Amber Infinity Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onNewNotebook}>
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 32 32">
              <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12c3.31 0 6.32-1.34 8.49-3.51l-2.83-2.83C20.14 23.18 18.17 24 16 24c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.17 0 4.14.82 5.66 2.34l2.83-2.83C22.32 5.34 19.31 4 16 4z" fill="#f9ab00"/>
              <circle cx="23" cy="16" r="4.5" fill="#f9ab00"/>
            </svg>
          </div>

          {/* Notebook Title */}
          <div className="flex items-center gap-1.5">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  onUpdateTitle(titleInput || 'Untitled0.ipynb');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                    onUpdateTitle(titleInput || 'Untitled0.ipynb');
                  }
                }}
                autoFocus
                className="bg-black/60 border border-[var(--colab-orange)] px-1.5 py-0.5 text-xs text-[var(--colab-text)] rounded focus:outline-none"
              />
            ) : (
              <div 
                onClick={() => { setTitleInput(notebookTitle); setIsEditingTitle(true); }}
                className="font-medium text-[13px] hover:bg-[var(--colab-surface-hover)] px-1.5 py-0.5 rounded cursor-pointer max-w-[280px] truncate"
                title="Click to rename"
              >
                {notebookTitle.endsWith('.ipynb') ? notebookTitle : `${notebookTitle}.ipynb`}
              </div>
            )}
            
            <div className="text-[10px] text-[var(--colab-text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--colab-green)]" />
              <span>Drive</span>
            </div>
          </div>
        </div>

        {/* Right: Runtime resources, Connect button, Settings, Share, Avatar */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Hardware Resource Monitor (Colab style) */}
          <div 
            onClick={onOpenUsage}
            className="hidden md:flex items-center gap-2 px-2 py-1 bg-[var(--colab-bg)] border border-[var(--colab-border)] rounded text-[11px] cursor-pointer hover:border-[var(--colab-orange)] transition-colors"
            title="Runtime Resources: Groq Ultra-Fast LPU / Python 3"
          >
            <div className="flex items-center gap-1 text-[var(--colab-green)] font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Connected</span>
            </div>
            <span className="text-[var(--colab-border)]">|</span>
            <div className="text-[10px] text-[var(--colab-text-muted)] font-mono">
              RAM <span className="text-[var(--colab-text)] font-semibold">0.9/12.7 GB</span>
            </div>
            <span className="text-[var(--colab-border)]">|</span>
            <div className="text-[10px] text-[var(--colab-text-muted)] font-mono">
              Disk <span className="text-[var(--colab-text)] font-semibold">24.1/107.7 GB</span>
            </div>
          </div>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 hover:bg-[var(--colab-surface-hover)] rounded text-[var(--colab-icon)] hover:text-[var(--colab-text)] transition-colors"
            title={isDarkTheme ? "Switch to Light theme" : "Switch to Dark theme"}
          >
            {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 hover:bg-[var(--colab-surface-hover)] rounded text-[var(--colab-icon)] hover:text-[var(--colab-text)] transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Share button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-3 py-1 bg-[var(--colab-orange)] hover:bg-[#e37400] text-black font-semibold text-xs rounded transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            S
          </div>
        </div>
      </div>

      {/* Menu Bar Row (File, Edit, View, Insert, Runtime, Tools, Help) */}
      <div className="h-6 px-3 flex items-center gap-1 border-t border-[var(--colab-border-subtle)] text-[11.5px] text-[var(--colab-text-muted)]">
        {menus.map((menu) => (
          <div key={menu.name} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menu.name ? null : menu.name)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.name)}
              className={`px-2 py-0.5 rounded hover:bg-[var(--colab-surface-hover)] hover:text-[var(--colab-text)] transition-colors ${
                activeMenu === menu.name ? 'bg-[var(--colab-surface-hover)] text-[var(--colab-text)]' : ''
              }`}
            >
              {menu.name}
            </button>

            {/* Dropdown menu */}
            {activeMenu === menu.name && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                <div className="absolute top-full left-0 mt-0.5 w-52 bg-[var(--colab-surface)] border border-[var(--colab-border)] shadow-2xl py-1 rounded z-50 animate-in fade-in zoom-in-95 duration-100">
                  {menu.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action();
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[var(--colab-surface-hover)] text-left text-xs text-[var(--colab-text)]"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-[10px] text-[var(--colab-text-muted)] font-mono">{item.shortcut}</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </header>
  );
};
