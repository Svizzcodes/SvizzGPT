import React, { useState } from 'react';
import { Play, Check, Copy, RotateCcw, Maximize2, Trash2, Globe, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Message, Attachment } from '../../lib/types';
import { CodeBlock } from '../ui/CodeBlock';
import { CitationsList } from '../ui/CitationsList';
import { AttachmentPreview } from '../chat/AttachmentPreview';

interface ColabCellProps {
  userMessage?: Message;
  assistantMessage?: Message;
  cellIndex: number;
  isStreaming?: boolean;
  onRunPrompt?: (content: string, attachments: Attachment[]) => void;
  onFocusCell?: () => void;
  onDeleteCell?: () => void;
}

export const ColabCell: React.FC<ColabCellProps> = ({
  userMessage,
  assistantMessage,
  cellIndex,
  isStreaming = false,
  onRunPrompt,
  onFocusCell,
  onDeleteCell
}) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = async () => {
    if (!assistantMessage) return;
    try {
      await navigator.clipboard.writeText(assistantMessage.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const isWorking = isStreaming && !!assistantMessage && assistantMessage.status === 'streaming';
  const hasError = assistantMessage?.status === 'error';

  return (
    <div className="w-full max-w-4xl mx-auto my-3 border border-[var(--colab-border)] bg-[var(--colab-cell-bg)] rounded text-xs font-sans shadow-sm group hover:border-[var(--colab-orange)] transition-colors">
      {/* 1. Cell Input Bar (Colab Code Box with Run Button) */}
      <div className="flex items-start bg-[var(--colab-surface)] border-b border-[var(--colab-border-subtle)] p-2 gap-2 relative">
        {/* Circular Run / Play Button */}
        <div className="pt-0.5 shrink-0 select-none">
          {isWorking ? (
            <div className="w-6 h-6 colab-spinner flex items-center justify-center text-[var(--colab-orange)]">
              <span className="text-[9px] font-mono">[*]</span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (userMessage && onRunPrompt) {
                  onRunPrompt(userMessage.content, userMessage.attachments || []);
                }
              }}
              className="w-6 h-6 rounded-full border border-[var(--colab-border)] hover:border-[var(--colab-orange)] bg-[var(--colab-bg)] flex items-center justify-center text-[var(--colab-icon)] hover:text-[var(--colab-orange)] transition-colors shadow-xs"
              title="Run cell (Shift+Enter)"
            >
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </button>
          )}
        </div>

        {/* Code Input (Query/Code representation) */}
        <div className="flex-1 min-w-0 font-mono text-xs leading-relaxed">
          {/* Formatted Code / Prompt Text */}
          <div className="text-[var(--colab-text)] whitespace-pre-wrap select-text">
            {userMessage ? (
              <>
                <span className="text-[var(--colab-text-muted)] select-none"># @title </span>
                <span className="text-[var(--colab-text)]">{userMessage.content}</span>
              </>
            ) : (
              <span className="text-[var(--colab-text-muted)] italic"># Type instructions or Python query...</span>
            )}
          </div>

          {/* Uploaded Attachments */}
          {userMessage?.attachments && userMessage.attachments.length > 0 && (
            <div className="mt-2">
              <AttachmentPreview attachments={userMessage.attachments} readOnly />
            </div>
          )}
        </div>

        {/* Top-Right Cell Quick Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[var(--colab-icon)] select-none">
          {onFocusCell && (
            <button
              onClick={onFocusCell}
              className="p-1 hover:text-[var(--colab-orange)] hover:bg-[var(--colab-surface-hover)] rounded"
              title="Isolate Cell (Focus Mode)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteCell && (
            <button
              onClick={onDeleteCell}
              className="p-1 hover:text-red-400 hover:bg-[var(--colab-surface-hover)] rounded"
              title="Delete cell"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Cell Output Area (Rendered Stream / Markdown) */}
      {assistantMessage && (
        <div className="p-4 bg-[var(--colab-cell-bg)] select-text">
          {/* Output Status Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--colab-border-subtle)] text-[11px] text-[var(--colab-text-muted)] font-mono select-none">
            <div className="flex items-center gap-2">
              <span className="text-[var(--colab-green)] flex items-center gap-1 font-semibold">
                <Check className="w-3 h-3" />
                <span>[{cellIndex}]</span>
              </span>
              <span>•</span>
              <span className="text-[var(--colab-orange)] uppercase font-semibold">
                {assistantMessage.model || 'GROQ-QWEN-3.8'}
              </span>
              <span>•</span>
              <span>{new Date(assistantMessage.created_at).toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-[var(--colab-text)]"
                title="Copy output"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Output Error if any */}
          {hasError && (
            <div className="p-2.5 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono rounded">
              <span className="font-bold text-red-400">[Traceback / Runtime Error]: </span>
              <span>{assistantMessage.error_message || assistantMessage.content}</span>
            </div>
          )}

          {/* Formatted Markdown Output */}
          {!hasError && (
            <div className="colab-prose leading-relaxed">
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
                      <code className="px-1 py-0.5 bg-[var(--colab-surface)] border border-[var(--colab-border)] text-[var(--colab-orange)] font-mono text-xs rounded" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {assistantMessage.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Generated Image Attachments */}
          {assistantMessage.attachments && assistantMessage.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {assistantMessage.attachments.map((att, i) => (
                att.file_type === 'image' && att.url ? (
                  <div key={i} className="border border-[var(--colab-border)] rounded overflow-hidden max-w-lg">
                    <img src={att.url} alt={att.filename} className="w-full max-h-96 object-contain bg-black" />
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
      )}
    </div>
  );
};
