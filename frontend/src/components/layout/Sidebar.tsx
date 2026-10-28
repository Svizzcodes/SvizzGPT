import React, { useState } from 'react';
import { Plus, Search, Pin, MessageSquare, Trash2, Settings, BarChart2, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { Conversation } from '../../lib/types';
import { AsciiLogo } from '../ascii/AsciiLogo';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onOpenSettings: () => void;
  onOpenUsage: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePin,
  onOpenSettings,
  onOpenUsage,
  isOpen,
  onToggleOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filtered.filter(c => c.is_pinned);
  const recent = filtered.filter(c => !c.is_pinned);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-zinc-950/95 border-r border-svizz-border flex flex-col transition-transform duration-300 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-svizz-border flex items-center justify-between">
          <AsciiLogo size="sm" />
          <button
            onClick={onToggleOpen}
            className="p-1 hover:text-svizz-accent transition-colors lg:hidden text-svizz-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onToggleOpen();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-svizz-accent text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-svizz-accentHover transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>NEW CHAT</span>
          </button>
        </div>

        {/* Search Conversations */}
        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-black border border-svizz-border focus-within:border-svizz-accent text-xs font-mono">
            <Search className="w-3.5 h-3.5 text-svizz-muted shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent text-svizz-text placeholder-zinc-600 focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 font-mono text-xs">
          {/* Pinned Section */}
          {pinned.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-svizz-muted font-bold tracking-widest uppercase flex items-center gap-1">
                <Pin className="w-2.5 h-2.5 text-svizz-accent" />
                <span>PINNED ({pinned.length})</span>
              </div>
              <div className="space-y-0.5">
                {pinned.map(c => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    isActive={c.id === activeConversationId}
                    onSelect={() => {
                      onSelectConversation(c.id);
                      if (window.innerWidth < 1024) onToggleOpen();
                    }}
                    onDelete={() => onDeleteConversation(c.id)}
                    onTogglePin={() => onTogglePin(c.id, false)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Section */}
          <div>
            <div className="px-2 py-1 text-[10px] text-svizz-muted font-bold tracking-widest uppercase">
              RECENT CONVERSATIONS
            </div>
            {recent.length === 0 && pinned.length === 0 ? (
              <div className="px-3 py-6 text-center text-zinc-600 text-[11px] font-mono">
                [NO CONVERSATIONS FOUND]
              </div>
            ) : (
              <div className="space-y-0.5">
                {recent.map(c => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    isActive={c.id === activeConversationId}
                    onSelect={() => {
                      onSelectConversation(c.id);
                      if (window.innerWidth < 1024) onToggleOpen();
                    }}
                    onDelete={() => onDeleteConversation(c.id)}
                    onTogglePin={() => onTogglePin(c.id, true)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-svizz-border space-y-1 font-mono text-xs">
          <button
            onClick={onOpenUsage}
            className="w-full flex items-center justify-between p-2 hover:bg-zinc-900 text-svizz-muted hover:text-svizz-text transition-colors border border-transparent hover:border-svizz-border"
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-svizz-accent" />
              <span className="text-[11px] uppercase">USAGE & METRICS</span>
            </div>
            <span className="text-[10px] text-svizz-accent font-bold">API ACTIVE</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 p-2 hover:bg-zinc-900 text-svizz-muted hover:text-svizz-text transition-colors border border-transparent hover:border-svizz-border"
          >
            <Settings className="w-3.5 h-3.5 text-svizz-accent" />
            <span className="text-[11px] uppercase">APPEARANCE & SETTINGS</span>
          </button>
        </div>
      </aside>
    </>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onTogglePin
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between px-2.5 py-2 cursor-pointer transition-all border ${
        isActive
          ? 'bg-black border-svizz-accent text-svizz-accent font-bold'
          : 'border-transparent hover:bg-zinc-900/80 text-zinc-400 hover:text-svizz-text'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
        <span className="truncate text-[11px] font-sans">
          {conversation.title}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 hover:text-svizz-accent ${conversation.is_pinned ? 'text-svizz-accent' : 'text-zinc-500'}`}
          title={conversation.is_pinned ? "Unpin" : "Pin"}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-zinc-500 hover:text-rose-400"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
