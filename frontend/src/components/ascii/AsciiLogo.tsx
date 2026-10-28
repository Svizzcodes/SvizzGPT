import React from 'react';

interface AsciiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const AsciiLogo: React.FC<AsciiLogoProps> = ({ size = 'md', animated = false }) => {
  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2 select-none group">
        <div className="px-1.5 py-0.5 bg-svizz-accent text-black font-mono font-bold text-xs tracking-tighter">
          S//
        </div>
        <div className="font-display font-black tracking-tight text-svizz-text text-sm flex items-center gap-1">
          <span>SVIZZ</span>
          <span className="text-svizz-accent font-mono font-normal text-xs opacity-75">GPT</span>
        </div>
      </div>
    );
  }

  return (
    <div className="select-none flex flex-col items-center justify-center text-center">
      <div className="relative mb-2">
        <pre className="font-mono text-[9px] sm:text-[11px] leading-[1.15] text-svizz-accent tracking-tighter filter drop-shadow-[0_0_8px_var(--svizz-glow)] overflow-hidden">
{`
  ███████╗██╗   ██╗██╗███████╗███████╗ ██████╗ ██████╗ ████████╗
  ██╔════╝██║   ██║██║╚══███╔╝╚══███╔╝██╔════╝ ██╔══██╗╚══██╔══╝
  ███████╗██║   ██║██║  ███╔╝   ███╔╝ ██║  ███╗██████╔╝   ██║   
  ╚════██║╚██╗ ██╔╝██║ ███╔╝   ███╔╝  ██║   ██║██╔═══╝    ██║   
  ███████║ ╚████╔╝ ██║███████╗███████╗╚██████╔╝██║        ██║   
  ╚══════╝  ╚═══╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝        ╚═╝   
`}
        </pre>
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-svizz-muted uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-svizz-accent animate-pulse" />
        <span>MULTIMODAL INTELLIGENCE ENGINE</span>
        <span className="text-svizz-border">|</span>
        <span>SYS.V1.0</span>
      </div>
    </div>
  );
};
