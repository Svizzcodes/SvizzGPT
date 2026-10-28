import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { Citation } from '../../lib/types';

interface CitationsListProps {
  citations: Citation[];
}

export const CitationsList: React.FC<CitationsListProps> = ({ citations }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-svizz-border font-mono text-xs">
      <div className="flex items-center gap-1.5 text-svizz-muted mb-2 text-[11px] tracking-wider uppercase">
        <Globe className="w-3 h-3 text-svizz-accent" />
        <span>Verified Sources & Web Citations ({citations.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {citations.map((c, idx) => (
          <a
            key={idx}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 p-2 bg-black/50 border border-svizz-border hover:border-svizz-accent transition-colors group text-left"
          >
            <span className="text-[10px] px-1 bg-svizz-accent-muted text-svizz-accent font-bold mt-0.5">
              [{idx + 1}]
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-svizz-text font-medium text-xs truncate group-hover:text-svizz-accent transition-colors">
                {c.title || c.url}
              </div>
              <div className="text-[10px] text-svizz-muted truncate mt-0.5">
                {c.url}
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-svizz-muted group-hover:text-svizz-accent shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
};
