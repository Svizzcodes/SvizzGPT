import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'code', value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const lines = value.trim().split('\n');

  return (
    <div className="relative my-4 border border-svizz-border bg-black/90 rounded-none overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950 border-b border-svizz-border text-[11px] text-svizz-muted select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-svizz-accent" />
          <span className="text-svizz-text font-bold uppercase tracking-wider">{language}</span>
          <span className="opacity-50">[{lines.length} lines]</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 border border-svizz-border hover:border-svizz-accent hover:text-svizz-accent transition-colors text-svizz-muted"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>

      {/* Code content with line numbers */}
      <div className="overflow-x-auto p-4 flex gap-4 text-zinc-300 leading-relaxed font-mono">
        <div className="select-none text-zinc-600 text-right pr-2 border-r border-zinc-800/80">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 font-mono text-xs leading-relaxed overflow-visible whitespace-pre">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};
