import React, { useEffect } from 'react';
import { X, Maximize2, Sparkles, Copy, Check } from 'lucide-react';
import { Message } from '../../lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CodeBlock } from '../ui/CodeBlock';
import { CitationsList } from '../ui/CitationsList';

interface FocusMessageModalProps {
  message: Message | null;
  onClose: () => void;
}

export const FocusMessageModal: React.FC<FocusMessageModalProps> = ({ message, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!message) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300 select-text"
      onClick={onClose}
    >
      {/* Subtle Focus Mode Status Indicator Bar */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between font-mono text-[11px] text-svizz-muted border-b border-svizz-border/40 pb-2 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-svizz-accent animate-ping" />
          <span className="text-svizz-accent font-bold tracking-widest">[SVIZZ // ISOLATION MODE]</span>
          <span className="opacity-50">|</span>
          <span>PRESS [ESC] OR CLICK OUTSIDE TO EXIT</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-1 text-svizz-text hover:text-svizz-accent transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:text-svizz-accent transition-colors"
            title="Exit Focus Mode (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Solitary Message Container */}
      <div 
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-10 bg-black/90 border border-svizz-border/60 shadow-[0_0_80px_var(--svizz-glow)] text-svizz-text leading-relaxed font-sans relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4 font-mono text-[10px] text-svizz-muted tracking-wider border-b border-svizz-border pb-2">
          <Sparkles className="w-3 h-3 text-svizz-accent" />
          <span className="text-svizz-accent font-bold uppercase">{message.model || 'SVIZZ-OMNI'}</span>
          <span>•</span>
          <span>{new Date(message.created_at).toLocaleTimeString()}</span>
        </div>

        {/* Markdown Rendered Content */}
        <div className="svizz-prose text-sm sm:text-base leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const value = String(children).replace(/\n$/, '');
                return !inline ? (
                  <CodeBlock language={match ? match[1] : 'code'} value={value} />
                ) : (
                  <code className="px-1.5 py-0.5 bg-zinc-900 border border-svizz-border text-svizz-accent font-mono text-xs" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Attachments if present */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.attachments.map((att, i) => (
              att.file_type === 'image' && att.url ? (
                <div key={i} className="my-2 border border-svizz-border overflow-hidden max-w-md">
                  <img src={att.url} alt={att.filename} className="max-h-80 w-auto object-contain bg-black" />
                </div>
              ) : null
            ))}
          </div>
        )}

        {/* Citations if present */}
        {message.metadata?.citations && (
          <CitationsList citations={message.metadata.citations} />
        )}
      </div>
    </div>
  );
};
