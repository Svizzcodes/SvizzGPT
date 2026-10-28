import React, { useState } from 'react';
import { X, Sliders, Palette, Zap, Database, Terminal, Shield, Check, Trash2, Download } from 'lucide-react';
import { UserSettings, ThemeName, WallpaperMode } from '../../lib/types';
import { THEME_PRESETS, WALLPAPER_MODES, AVAILABLE_MODELS } from '../../lib/constants';
import { UsagePanel } from '../ui/UsagePanel';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearAllConversations: () => void;
  activeTab?: 'general' | 'ai' | 'usage' | 'data';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllConversations,
  activeTab: initialTab = 'general'
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'usage' | 'data'>(initialTab);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono text-xs"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-svizz-accent/80 shadow-[0_0_60px_var(--svizz-glow)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-svizz-border flex items-center justify-between bg-black">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-svizz-accent inline-block" />
            <span className="font-bold tracking-wider text-svizz-text uppercase">
              SVIZZGPT // SYSTEM CONFIGURATION
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:text-svizz-accent text-svizz-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-svizz-border bg-black/60 text-[11px]">
          {[
            { id: 'general', label: 'APPEARANCE & ASCII', icon: <Palette className="w-3 h-3" /> },
            { id: 'ai', label: 'AI & MODEL', icon: <Terminal className="w-3 h-3" /> },
            { id: 'usage', label: 'USAGE & TELEMETRY', icon: <Zap className="w-3 h-3" /> },
            { id: 'data', label: 'DATA & STORAGE', icon: <Database className="w-3 h-3" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 transition-colors border-r border-svizz-border last:border-r-0 ${
                activeTab === tab.id
                  ? 'bg-zinc-900 border-b-2 border-b-svizz-accent text-svizz-accent font-bold'
                  : 'text-svizz-muted hover:text-svizz-text hover:bg-zinc-950'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-zinc-950/80">
          {/* TAB 1: APPEARANCE */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Color Theme Selector */}
              <div>
                <div className="text-[11px] text-svizz-muted uppercase mb-2">
                  ACCENT COLOR THEME
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {THEME_PRESETS.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => onUpdateSettings({ theme: theme.id })}
                      className={`p-2.5 border text-left flex flex-col justify-between transition-all ${
                        settings.theme === theme.id
                          ? 'border-svizz-accent bg-black shadow-[0_0_15px_var(--svizz-glow)] font-bold'
                          : 'border-svizz-border hover:border-zinc-500 bg-black/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="w-3 h-3 rounded-full border border-black"
                          style={{ backgroundColor: theme.hex }}
                        />
                        {settings.theme === theme.id && (
                          <Check className="w-3 h-3 text-svizz-accent" />
                        )}
                      </div>
                      <span className="text-svizz-text text-[11px] truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ASCII Wallpaper Mode */}
              <div>
                <div className="text-[11px] text-svizz-muted uppercase mb-2">
                  ASCII WALLPAPER BACKGROUND
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WALLPAPER_MODES.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => onUpdateSettings({ ascii_wallpaper: mode.id })}
                      className={`p-2 border text-left flex items-start gap-2 transition-all ${
                        settings.ascii_wallpaper === mode.id
                          ? 'border-svizz-accent bg-black font-bold text-svizz-accent'
                          : 'border-svizz-border hover:border-zinc-500 bg-black/40 text-svizz-muted hover:text-svizz-text'
                      }`}
                    >
                      <span className="text-[10px] mt-0.5">[{mode.id.toUpperCase()}]</span>
                      <div>
                        <div className="text-svizz-text text-[11px] font-bold">{mode.name}</div>
                        <div className="text-[9px] text-zinc-500">{mode.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Intensity & Speed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-[10px] text-svizz-muted mb-1">
                    <span>ANIMATION INTENSITY</span>
                    <span>{Math.round(settings.ascii_intensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.ascii_intensity}
                    onChange={(e) => onUpdateSettings({ ascii_intensity: parseFloat(e.target.value) })}
                    className="w-full accent-svizz-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-svizz-muted mb-1">
                    <span>ANIMATION SPEED</span>
                    <span>{settings.ascii_speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.0"
                    step="0.1"
                    value={settings.ascii_speed}
                    onChange={(e) => onUpdateSettings({ ascii_speed: parseFloat(e.target.value) })}
                    className="w-full accent-svizz-accent"
                  />
                </div>
              </div>

              {/* Visual Toggles */}
              <div className="pt-2 border-t border-svizz-border space-y-2">
                <label className="flex items-center justify-between p-2 border border-svizz-border bg-black/40 hover:border-svizz-accent cursor-pointer">
                  <div>
                    <div className="text-svizz-text font-bold">CRT PHOSPHOR SCANLINES</div>
                    <div className="text-[10px] text-svizz-muted">Add subtle retro CRT horizontal scanline raster</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.scanline_effect}
                    onChange={(e) => onUpdateSettings({ scanline_effect: e.target.checked })}
                    className="accent-svizz-accent w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 border border-svizz-border bg-black/40 hover:border-svizz-accent cursor-pointer">
                  <div>
                    <div className="text-svizz-text font-bold">REDUCED MOTION</div>
                    <div className="text-[10px] text-svizz-muted">Freeze background ASCII animations for minimal CPU/GPU</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reduced_motion}
                    onChange={(e) => onUpdateSettings({ reduced_motion: e.target.checked })}
                    className="accent-svizz-accent w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: AI CONFIG */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] text-svizz-muted uppercase mb-2">
                  DEFAULT REASONING MODEL
                </div>
                <div className="space-y-2">
                  {AVAILABLE_MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => onUpdateSettings({ default_model: model.id })}
                      className={`w-full p-3 border text-left flex items-start justify-between transition-all ${
                        settings.default_model === model.id
                          ? 'border-svizz-accent bg-black font-bold'
                          : 'border-svizz-border hover:border-zinc-500 bg-black/40'
                      }`}
                    >
                      <div>
                        <div className="text-svizz-text font-bold flex items-center gap-2">
                          <span>{model.name}</span>
                          <span className="text-[9px] px-1 py-0.5 bg-svizz-accent-muted text-svizz-accent border border-svizz-border">
                            {model.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-svizz-muted mt-1">{model.description}</p>
                      </div>
                      {settings.default_model === model.id && (
                        <Check className="w-4 h-4 text-svizz-accent shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-svizz-muted uppercase mb-1">
                  CUSTOM SYSTEM INSTRUCTIONS
                </div>
                <p className="text-[10px] text-svizz-muted mb-2">
                  Override default assistant instructions for custom personal behavior.
                </p>
                <textarea
                  value={settings.system_instructions || ''}
                  onChange={(e) => onUpdateSettings({ system_instructions: e.target.value })}
                  placeholder="You are SvizzGPT, an expert software engineer..."
                  rows={4}
                  className="w-full p-3 bg-black border border-svizz-border focus:border-svizz-accent text-svizz-text text-xs focus:outline-none resize-none font-sans"
                />
              </div>
            </div>
          )}

          {/* TAB 3: USAGE */}
          {activeTab === 'usage' && (
            <UsagePanel />
          )}

          {/* TAB 4: DATA */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 border border-svizz-border bg-black/50 space-y-2">
                <div className="text-svizz-text font-bold">DATABASE PERSISTENCE</div>
                <p className="text-[11px] text-svizz-muted">
                  All conversations, attachments, and settings are stored locally in the high-performance SQLite database on the server.
                </p>
              </div>

              <div className="p-4 border border-red-500/40 bg-red-950/20 space-y-3">
                <div className="text-red-400 font-bold flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span>DANGER ZONE</span>
                </div>
                <p className="text-[11px] text-red-200/80">
                  Permanently delete all conversation threads, messages, and uploaded files.
                </p>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete ALL conversations permanently?")) {
                      onClearAllConversations();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs uppercase"
                >
                  Clear All History
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-svizz-border bg-black flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-svizz-accent text-black font-bold text-xs uppercase hover:bg-svizz-accentHover"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
