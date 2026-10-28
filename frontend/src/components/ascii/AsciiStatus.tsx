import React from 'react';

interface AsciiStatusProps {
  status: string; // 'PROCESSING' | 'REASONING' | 'GENERATING' | 'FINALIZING' | 'READY' | 'ERROR'
  model?: string;
  tokens?: number;
}

export const AsciiStatus: React.FC<AsciiStatusProps> = ({ status, model = 'gpt-4o', tokens }) => {
  const getStatusGlyph = (st: string) => {
    switch (st.toUpperCase()) {
      case 'PROCESSING': return '░▒▓';
      case 'REASONING': return '◰◱◲◳';
      case 'GENERATING': return '█▒░';
      case 'FINALIZING': return '■■■';
      case 'ERROR': return '[!]';
      default: return '::';
    }
  };

  const isWorking = ['PROCESSING', 'REASONING', 'GENERATING', 'FINALIZING'].includes(status.toUpperCase());

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-svizz-card border border-svizz-border rounded-none font-mono text-[11px] text-svizz-muted tracking-wider select-none">
      <span className={`text-svizz-accent ${isWorking ? 'animate-pulse' : ''}`}>
        {getStatusGlyph(status)}
      </span>
      <span className="text-svizz-text font-semibold uppercase">{status}</span>
      <span className="text-svizz-border">/</span>
      <span className="opacity-70">{model}</span>
      {tokens !== undefined && (
        <>
          <span className="text-svizz-border">/</span>
          <span className="opacity-70">{tokens} TOKENS</span>
        </>
      )}
    </div>
  );
};
