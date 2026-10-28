import React from 'react';
import { AsciiLogo } from '../ascii/AsciiLogo';
import { EMPTY_PROMPT_SUGGESTIONS } from '../../lib/constants';
import { Sparkles, Terminal, Image as ImageIcon, Binary, ArrowUpRight } from 'lucide-react';

interface EmptyChatHeroProps {
  onSelectPrompt: (prompt: string) => void;
  apiKeyConfigured: boolean;
}

export const EmptyChatHero: React.FC<EmptyChatHeroProps> = ({ onSelectPrompt, apiKeyConfigured }) => {
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'code': return <Terminal className="w-3.5 h-3.5" />;
      case 'vision': return <Binary className="w-3.5 h-3.5" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-8 text-center select-none">
      {/* Brand Hero */}
      <div className="mb-8">
        <AsciiLogo size="lg" />
      </div>

      {/* API Key Status Notice if needed */}
      {!apiKeyConfigured && (
        <div className="mb-6 p-3 bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs font-mono max-w-md text-left flex items-start gap-2">
          <span className="font-bold text-amber-400">[NOTICE]</span>
          <div>
            <span>Add your </span>
            <code className="bg-black/80 px-1 py-0.5 border border-amber-500/30 text-amber-300">OPENAI_API_KEY</code>
            <span> in </span>
            <code className="bg-black/80 px-1 py-0.5 border border-amber-500/30 text-amber-300">.env</code>
            <span> to activate full multimodal reasoning.</span>
          </div>
        </div>
      )}

      {/* Suggested Prompts Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {EMPTY_PROMPT_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative p-3.5 bg-black/60 border border-svizz-border hover:border-svizz-accent transition-all duration-200 flex flex-col justify-between hover:bg-black/80"
          >
            <div className="flex items-center justify-between w-full mb-1.5 font-mono text-[10px] text-svizz-muted group-hover:text-svizz-accent transition-colors">
              <div className="flex items-center gap-1.5 uppercase font-bold tracking-wider">
                {getIcon(item.category)}
                <span>{item.title}</span>
              </div>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-svizz-text opacity-85 leading-relaxed font-sans">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>

      {/* Footer System Specs */}
      <div className="mt-8 flex items-center gap-4 text-[10px] font-mono text-svizz-muted uppercase tracking-widest">
        <span>TEXT</span>
        <span>•</span>
        <span>IMAGE UNDERSTANDING</span>
        <span>•</span>
        <span>IMAGE GEN</span>
        <span>•</span>
        <span>PDF / CODE</span>
        <span>•</span>
        <span>WEB SEARCH</span>
      </div>
    </div>
  );
};
