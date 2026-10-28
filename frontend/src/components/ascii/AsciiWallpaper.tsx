import React, { useEffect, useRef } from 'react';
import { WallpaperMode, ThemeName } from '../../lib/types';

interface AsciiWallpaperProps {
  mode: WallpaperMode;
  intensity: number; // 0.1 to 1.0
  speed: number; // 0.2 to 2.0
  reducedMotion: boolean;
  theme: ThemeName;
}

const ASCII_CHARS = ['·', '+', 'x', '░', '▒', '▓', '█', ':', ';', '=', '~', '*', '#', '/', '\\'];

export const AsciiWallpaper: React.FC<AsciiWallpaperProps> = ({
  mode,
  intensity = 0.8,
  speed = 1.0,
  reducedMotion = false,
  theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (mode === 'void') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Get theme color
    const computedStyle = getComputedStyle(document.documentElement);
    const accentColor = computedStyle.getPropertyValue('--svizz-accent').trim() || '#ffffff';

    const charSize = 14;
    const cols = Math.floor(width / charSize);
    const rows = Math.floor(height / charSize);

    // Rain mode columns state
    const rainDrops: number[] = Array.from({ length: cols }, () => Math.floor(Math.random() * -rows));

    // Particle mode state
    const particleCount = Math.floor(50 * intensity);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed * 0.8,
      vy: (Math.random() - 0.5) * speed * 0.8,
      char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
      alpha: Math.random() * 0.7 + 0.3
    }));

    let frame = 0;

    const render = () => {
      frame++;

      // Background clearing with fade for trail effects
      ctx.fillStyle = 'rgba(9, 9, 11, 0.2)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${charSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = accentColor;

      const baseAlpha = 0.15 * intensity;

      if (mode === 'grid') {
        const step = 4;
        for (let r = 0; r < rows; r += step) {
          for (let c = 0; c < cols; c += step) {
            const wave = Math.sin((c + frame * 0.03 * speed) * 0.2) * Math.cos((r + frame * 0.02 * speed) * 0.2);
            ctx.globalAlpha = Math.max(0.03, (wave + 1) * 0.5 * baseAlpha);
            const symbol = wave > 0.4 ? '+' : wave > 0 ? '·' : ' ';
            ctx.fillText(symbol, c * charSize, r * charSize);
          }
        }
      } else if (mode === 'particles') {
        for (const p of particles) {
          if (!reducedMotion) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
          }

          ctx.globalAlpha = p.alpha * baseAlpha * 1.5;
          ctx.fillText(p.char, p.x, p.y);
        }
      } else if (mode === 'rain') {
        for (let i = 0; i < rainDrops.length; i++) {
          const char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
          const x = i * charSize;
          const y = rainDrops[i] * charSize;

          ctx.globalAlpha = baseAlpha * (Math.random() * 0.8 + 0.4);
          ctx.fillText(char, x, y);

          if (!reducedMotion) {
            if (y > height && Math.random() > 0.975) {
              rainDrops[i] = 0;
            } else {
              rainDrops[i] += (0.5 + Math.random() * 0.5) * speed;
            }
          }
        }
      } else if (mode === 'topographic') {
        const lineSpacing = 3;
        for (let r = 0; r < rows; r += lineSpacing) {
          for (let c = 0; c < cols; c += 2) {
            const x = c * charSize;
            const y = r * charSize;
            const val = Math.sin(c * 0.08 + frame * 0.02 * speed) + Math.cos(r * 0.08 + frame * 0.015 * speed);
            ctx.globalAlpha = Math.max(0.02, (val + 2) / 4 * baseAlpha);
            const char = val > 1.2 ? '=' : val > 0.4 ? '-' : val > -0.4 ? '·' : ' ';
            ctx.fillText(char, x, y);
          }
        }
      } else if (mode === 'signal') {
        const centerY = Math.floor(rows / 2);
        for (let c = 0; c < cols; c++) {
          const amp = Math.sin(c * 0.05 + frame * 0.04 * speed) * Math.cos(c * 0.02 - frame * 0.02 * speed);
          const barHeight = Math.floor(Math.abs(amp) * 12);
          for (let h = -barHeight; h <= barHeight; h++) {
            const r = centerY + h;
            if (r >= 0 && r < rows) {
              ctx.globalAlpha = (1 - Math.abs(h) / (barHeight + 1)) * baseAlpha * 1.8;
              ctx.fillText(h === 0 ? '█' : '░', c * charSize, r * charSize);
            }
          }
        }
      } else if (mode === 'noise') {
        for (let r = 0; r < rows; r += 2) {
          for (let c = 0; c < cols; c += 2) {
            if (Math.random() < 0.15 * intensity) {
              ctx.globalAlpha = Math.random() * baseAlpha * 1.2;
              const char = ASCII_CHARS[Math.floor(Math.random() * 4)];
              ctx.fillText(char, c * charSize, r * charSize);
            }
          }
        }
      }

      ctx.globalAlpha = 1.0;

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, intensity, speed, reducedMotion, theme]);

  if (mode === 'void') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ filter: 'contrast(120%)' }}
    />
  );
};
