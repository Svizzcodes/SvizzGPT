import React from 'react';
import { Play, Sparkles, Terminal, FileCode, CheckCircle } from 'lucide-react';

interface ColabHeroProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ColabHero: React.FC<ColabHeroProps> = ({ onSelectPrompt }) => {
  const sampleCells = [
    {
      title: "1. Event-Driven Architecture",
      code: "Design a high-concurrency event-driven architecture in TypeScript with clean interfaces.",
    },
    {
      title: "2. Transformer Self-Attention Math",
      code: "Explain the mathematics behind Transformer Multi-Head Self-Attention with LaTeX equations ($...$).",
    },
    {
      title: "3. Async Worker Queue in Python",
      code: "Write a complete memory-efficient async worker queue in Python with retry policies and backoff.",
    },
    {
      title: "4. Multimodal Vision Analysis",
      code: "Upload an architectural diagram, screenshot, or dataset for automated multi-step extraction.",
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-text font-sans text-xs">
      {/* Colab Notebook Title Header */}
      <div className="mb-6 border-b border-[var(--colab-border)] pb-4">
        <h1 className="text-xl font-bold text-[var(--colab-text)] flex items-center gap-2 mb-1">
          <span>Welcome to Colaboratory // SvizzGPT</span>
        </h1>
        <p className="text-[var(--colab-text-muted)] text-xs leading-relaxed">
          SvizzGPT runs with high-performance Groq LPU acceleration and multi-provider intelligence.
          Click any cell or press <kbd className="px-1.5 py-0.5 bg-[var(--colab-surface)] border border-[var(--colab-border)] rounded text-[10px] font-mono">Shift+Enter</kbd> in the prompt bar below to execute queries.
        </p>
      </div>

      {/* Starter Notebook Code Cells */}
      <div className="space-y-3 mb-6">
        <div className="text-[11px] font-semibold text-[var(--colab-text-muted)] uppercase tracking-wider select-none mb-2">
          # Example Code Cells (Click to Run)
        </div>

        {sampleCells.map((sample, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrompt(sample.code)}
            className="border border-[var(--colab-border)] hover:border-[var(--colab-orange)] bg-[var(--colab-cell-bg)] rounded p-3 flex items-start justify-between cursor-pointer group transition-all shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full border border-[var(--colab-border)] group-hover:border-[var(--colab-orange)] bg-[var(--colab-surface)] flex items-center justify-center text-[var(--colab-icon)] group-hover:text-[var(--colab-orange)] shrink-0 transition-colors">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>

              <div>
                <div className="font-mono text-xs font-semibold text-[var(--colab-text)] group-hover:text-[var(--colab-orange)] transition-colors">
                  {sample.title}
                </div>
                <div className="text-[var(--colab-text-muted)] text-[11.5px] mt-0.5 font-mono">
                  {sample.code}
                </div>
              </div>
            </div>

            <span className="text-[10px] text-[var(--colab-text-muted)] group-hover:text-[var(--colab-orange)] font-mono uppercase select-none opacity-0 group-hover:opacity-100 transition-opacity">
              [Run Cell]
            </span>
          </div>
        ))}
      </div>

      {/* Runtime Environment Specs Badge */}
      <div className="p-3 bg-[var(--colab-surface)] border border-[var(--colab-border)] rounded text-[11px] font-mono text-[var(--colab-text-muted)] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-[var(--colab-green)]" />
          <span>Runtime: Python 3 (Groq LPU Accelerator / Multi-Provider)</span>
        </div>
        <span className="text-[var(--colab-orange)] font-semibold">Active & Ready</span>
      </div>
    </div>
  );
};
