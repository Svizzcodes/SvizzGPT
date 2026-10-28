import React, { useState } from 'react';
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, Maximize2, Trash2, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Message } from '../../lib/types';
import { CodeBlock } from '../ui/CodeBlock';
import { CitationsList } from '../ui/CitationsList';
import { AsciiStatus } from '../ascii/AsciiStatus';

interface AssistantMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onFocus?: () => void;
  onDelete?: () => void;
  onLikeToggle?: (isLiked: boolean) => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
  onFocus,
  onDelete,
  onLikeToggle
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(message.is_liked ?? null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleLike = (val: boolean) => {
    const nextVal = liked === val ? null : val;
    setLiked(nextVal);
    if (onLikeToggle && nextVal !== null) onLikeToggle(nextVal);
  };

  const isError = message.status === 'error';

  return (
    <div className="w-full py-6 border-b border-svizz-border/20 group">
      <div className="max-w-4xl mx-auto flex items-start gap-3 sm:gap-4 px-4 sm:px-6">
        {/* Assistant Monogram */}
        <div className="w-6 h-6 border border-svizz-border bg-svizz-accent text-black flex items-center justify-center font-mono text-[10px] shrink-0 mt-1 select-none font-bold">
          S//
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0">
          {/* Header Metadata Bar */}
          <div className="flex items-center justify-between mb-2 select-none">
            <div className="flex items-center gap-2 font-mono text-[10px] text-svizz-muted tracking-wider">
              <span className="text-svizz-text font-bold uppercase">{message.model || 'SVIZZ-OMNI'}</span>
              <span>•</span>
              <span>{new Date(message.created_at).toLocaleTimeString()}</span>
            </div>

            {/* Status during generation */}
            {isStreaming && (
              <AsciiStatus status="GENERATING" model={message.model} />
            )}
          </div>

          {/* Error Banner if applicable */}
          {isError && (
            <div className="my-3 p-3 bg-red-950/40 border border-red-500/60 text-red-200 text-xs font-mono space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SVIZZ SYSTEM FAULT</span>
              </div>
              <p className="text-[11px] opacity-90">{message.error_message || message.content}</p>
            </div>
          )}

          {/* Markdown Content */}
          {!isError && (
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
          )}

          {/* Generated Image Attachments if present */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {message.attachments.map((att, idx) => (
                att.file_type === 'image' && att.url ? (
                  <div key={idx} className="relative border border-svizz-border bg-black group/img overflow-hidden max-w-lg">
                    <img
                      src={att.url}
                      alt={att.filename}
                      className="w-full max-h-96 object-contain bg-black"
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/80 p-1 border border-svizz-border font-mono text-xs">
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 hover:text-svizz-accent"
                        title="Open full size"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={att.url}
                        download={att.filename}
                        className="p-1 hover:text-svizz-accent"
                        title="Download image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}

          {/* Citations if available */}
          {message.metadata?.citations && (
            <CitationsList citations={message.metadata.citations} />
          )}

          {/* Contextual Action Bar */}
          <div className="mt-3 pt-2 flex items-center gap-3 font-mono text-xs text-svizz-muted opacity-0 group-hover:opacity-100 transition-opacity select-none">
            {/* Copy Action */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-svizz-text transition-colors p-1"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copied ? 'COPIED' : 'COPY'}</span>
            </button>

            {/* Signature FOCUS / SPOTLIGHT Mode Action */}
            {onFocus && (
              <button
                onClick={onFocus}
                className="flex items-center gap-1 text-svizz-accent hover:text-svizz-accentHover transition-colors p-1 border border-svizz-border/60 hover:border-svizz-accent px-1.5"
                title="Isolate message in Focus Mode"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="text-[10px] font-bold tracking-wider">FOCUS</span>
              </button>
            )}

            {/* Regenerate Action */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 hover:text-svizz-text transition-colors p-1"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px]">REGEN</span>
              </button>
            )}

            {/* Like/Dislike */}
            <button
              onClick={() => handleLike(true)}
              className={`p-1 hover:text-svizz-text transition-colors ${liked === true ? 'text-svizz-accent' : ''}`}
              title="Helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleLike(false)}
              className={`p-1 hover:text-svizz-text transition-colors ${liked === false ? 'text-svizz-accent' : ''}`}
              title="Unhelpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 hover:text-rose-400 transition-colors ml-auto"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
