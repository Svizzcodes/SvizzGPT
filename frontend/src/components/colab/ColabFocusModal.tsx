import React, { useEffect } from 'react';
import { X, Copy, Check, Play, Maximize2 } from 'lucide-react';
import { Message } from '../../lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CodeBlock } from '../ui/CodeBlock';
import { CitationsList } from '../ui/CitationsList';

interface ColabFocusModalProps {
  userMessage?: Message;
  assistantMessage: Message | null;
  onClose: () => void;
}

export const ColabFocusModal: React.FC<ColabFocusModalProps> = ({
  userMessage,
  assistantMessage,
  onClose
}) => {
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

  if (!assistantMessage) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(assistantMessage.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-200 select-text"
      onClick={onClose}
    >
      {/* Colab Focus Status Bar */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between font-mono text-[11px] text-[var(--colab-text-muted)] border-b border-[var(--colab-border)] pb-2 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--colab-orange)] animate-ping" />
          <span className="text-[var(--colab-orange)] font-bold">[COLAB // CELL ISOLATION MODE]</span>
          <span className="opacity-50">|</span>
          <span>PRESS [ESC] OR CLICK OUTSIDE TO RETURN TO NOTEBOOK</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-1 text-[var(--colab-text)] hover:text-[var(--colab-orange)] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button onClick={onClose} className="p-1 hover:text-[var(--colab-orange)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Solitary Cell Container */}
      <div 
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-[var(--colab-cell-bg)] border border-[var(--colab-border)] rounded shadow-2xl text-[var(--colab-text)] relative my-auto font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cell Header with Query */}
        {userMessage && (
          <div className="mb-4 pb-3 border-b border-[var(--colab-border)] font-mono text-xs text-[var(--colab-text-muted)]">
            <span className="text-[var(--colab-orange)] font-semibold"># @title </span>
            <span className="text-[var(--colab-text)]">{userMessage.content}</span>
          </div>
        )}

        {/* Markdown Output */}
        <div className="colab-prose text-sm leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const value = String(children).replace(/\n$/, '');
                return !inline ? (
                  <CodeBlock language={match ? match[1] : 'python'} value={value} />
                ) : (
                  <code className="px-1.5 py-0.5 bg-[var(--colab-surface)] border border-[var(--colab-border)] text-[var(--colab-orange)] font-mono text-xs rounded" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {assistantMessage.content}
          </ReactMarkdown>
        </div>

        {/* Attachments if any */}
        {assistantMessage.attachments && assistantMessage.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {assistantMessage.attachments.map((att, i) => (
              att.file_type === 'image' && att.url ? (
                <div key={i} className="my-2 border border-[var(--colab-border)] rounded overflow-hidden max-w-md">
                  <img src={att.url} alt={att.filename} className="max-h-80 w-auto object-contain bg-black" />
                </div>
              ) : null
            ))}
          </div>
        )}

        {/* Citations if any */}
        {assistantMessage.metadata?.citations && (
          <CitationsList citations={assistantMessage.metadata.citations} />
        )}
      </div>
    </div>
  );
};
