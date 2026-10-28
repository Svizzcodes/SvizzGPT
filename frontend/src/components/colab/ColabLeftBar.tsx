import React from 'react';
import { 
  List, Search, Code2, Variable, Key, Folder, 
  Clock, Sparkles, MessageSquare, ChevronRight, X, Plus, Upload 
} from 'lucide-react';
import { Conversation } from '../../lib/types';

interface ColabLeftBarProps {
  activeTab: 'toc' | 'files' | 'history' | null;
  onSelectTab: (tab: 'toc' | 'files' | 'history' | null) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewNotebook: () => void;
  onFileUpload: (files: FileList | null) => void;
}

export const ColabLeftBar: React.FC<ColabLeftBarProps> = ({
  activeTab,
  onSelectTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewNotebook,
  onFileUpload
}) => {
  return (
    <div className="flex z-20 select-none">
      {/* Colab Narrow Vertical Icon Bar */}
      <div className="w-10 bg-[var(--colab-surface)] border-r border-[var(--colab-border)] flex flex-col items-center py-2 gap-3 text-[var(--colab-icon)]">
        {/* Table of Contents / Outline */}
        <button
          onClick={() => onSelectTab(activeTab === 'toc' ? null : 'toc')}
          className={`p-2 rounded hover:text-[var(--colab-text)] hover:bg-[var(--colab-surface-hover)] transition-colors ${
            activeTab === 'toc' ? 'text-[var(--colab-orange)] bg-[var(--colab-surface-hover)]' : ''
          }`}
          title="Table of contents"
        >
          <List className="w-4 h-4" />
        </button>

        {/* Files Browser */}
        <button
          onClick={() => onSelectTab(activeTab === 'files' ? null : 'files')}
          className={`p-2 rounded hover:text-[var(--colab-text)] hover:bg-[var(--colab-surface-hover)] transition-colors ${
            activeTab === 'files' ? 'text-[var(--colab-orange)] bg-[var(--colab-surface-hover)]' : ''
          }`}
          title="Files"
        >
          <Folder className="w-4 h-4" />
        </button>

        {/* Notebook History / Conversations */}
        <button
          onClick={() => onSelectTab(activeTab === 'history' ? null : 'history')}
          className={`p-2 rounded hover:text-[var(--colab-text)] hover:bg-[var(--colab-surface-hover)] transition-colors ${
            activeTab === 'history' ? 'text-[var(--colab-orange)] bg-[var(--colab-surface-hover)]' : ''
          }`}
          title="Saved Notebooks / Chats"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Code Snippets (aesthetic Colab icon) */}
        <button
          onClick={() => onSelectTab(activeTab === 'toc' ? null : 'toc')}
          className="p-2 rounded hover:text-[var(--colab-text)] hover:bg-[var(--colab-surface-hover)] transition-colors"
          title="Code snippets"
        >
          <Code2 className="w-4 h-4" />
        </button>

        {/* Secrets */}
        <button
          onClick={() => onSelectTab(activeTab === 'history' ? null : 'history')}
          className="p-2 rounded hover:text-[var(--colab-text)] hover:bg-[var(--colab-surface-hover)] transition-colors"
          title="Secrets"
        >
          <Key className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Drawer Panel */}
      {activeTab && (
        <div className="w-64 bg-[var(--colab-surface)] border-r border-[var(--colab-border)] flex flex-col font-sans text-xs animate-in slide-in-from-left-2 duration-150">
          {/* Header */}
          <div className="p-3 border-b border-[var(--colab-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--colab-text)] uppercase tracking-wider">
            <span>
              {activeTab === 'files' && 'Files (/content)'}
              {activeTab === 'toc' && 'Table of contents'}
              {activeTab === 'history' && 'Notebooks & Chats'}
            </span>
            <button onClick={() => onSelectTab(null)} className="p-1 hover:text-[var(--colab-orange)]">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tab 1: Files Drawer */}
          {activeTab === 'files' && (
            <div className="p-3 flex-1 flex flex-col space-y-3">
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-[var(--colab-bg)] border border-[var(--colab-border)] hover:border-[var(--colab-orange)] text-[var(--colab-text)] rounded cursor-pointer transition-colors text-[11px]">
                  <Upload className="w-3 h-3 text-[var(--colab-orange)]" />
                  <span>Upload to session</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => onFileUpload(e.target.files)}
                  />
                </label>
              </div>

              <div className="font-mono text-[11px] space-y-1 text-[var(--colab-text-muted)]">
                <div className="flex items-center gap-1.5 py-1 px-1 hover:bg-[var(--colab-surface-hover)] rounded cursor-pointer text-[var(--colab-text)]">
                  <Folder className="w-3.5 h-3.5 text-[var(--colab-orange)]" />
                  <span>sample_data/</span>
                </div>
                <div className="flex items-center gap-1.5 py-1 px-1 pl-4 hover:bg-[var(--colab-surface-hover)] rounded cursor-pointer">
                  <span>anscombe.json</span>
                </div>
                <div className="flex items-center gap-1.5 py-1 px-1 pl-4 hover:bg-[var(--colab-surface-hover)] rounded cursor-pointer">
                  <span>california_housing_train.csv</span>
                </div>
                <div className="flex items-center gap-1.5 py-1 px-1 pl-4 hover:bg-[var(--colab-surface-hover)] rounded cursor-pointer">
                  <span>mnist_train_small.csv</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Table of Contents */}
          {activeTab === 'toc' && (
            <div className="p-3 flex-1 text-[11px] text-[var(--colab-text-muted)] space-y-2">
              <div className="font-medium text-[var(--colab-text)] mb-1">Sections</div>
              <div className="hover:text-[var(--colab-orange)] cursor-pointer">1. Introduction & Setup</div>
              <div className="hover:text-[var(--colab-orange)] cursor-pointer">2. Model Execution & Inference</div>
              <div className="hover:text-[var(--colab-orange)] cursor-pointer">3. Output Analysis & Results</div>
            </div>
          )}

          {/* Tab 3: Saved Notebooks / Chats */}
          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button
                onClick={onNewNotebook}
                className="w-full flex items-center gap-1.5 py-1.5 px-2 bg-[var(--colab-orange)] text-black font-semibold rounded text-xs mb-2 hover:bg-[#e37400]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Notebook</span>
              </button>

              {conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs truncate ${
                    c.id === activeConversationId
                      ? 'bg-[var(--colab-bg)] border border-[var(--colab-orange)] text-[var(--colab-orange)] font-semibold'
                      : 'hover:bg-[var(--colab-surface-hover)] text-[var(--colab-text)]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{c.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
