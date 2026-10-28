import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  Send, X, Copy, Check, Paperclip, RotateCcw, 
  Trash2, Eye, EyeOff, Minus, Maximize2, ExternalLink,
  Move, ArrowUp, Sparkles, Pin, Monitor, ArrowDownLeft,
  Mic, MicOff, Image as ImageIcon, Sliders
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Attachment, Message } from '../../lib/types';
import { api } from '../../lib/api';

export const OverlayHUD: React.FC = () => {
  // Visibility, Dragging & Minimize State
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPipMinimized, setIsPipMinimized] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    // Center horizontally, near upper-center by default
    const initX = Math.max(20, Math.round((window.innerWidth - 540) / 2));
    const initY = Math.max(40, Math.round(window.innerHeight * 0.1));
    return { x: initX, y: initY };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Transparency & Theme Customization (Flat, No Shadows)
  // bgTransparency: 1.0 = solid, 0.75 = soft, 0.35 = glass, 0.0 = ghost (only text visible)
  const [bgTransparency, setBgTransparency] = useState<number>(1.0);
  const [themeColor, setThemeColor] = useState<'white' | 'light-grey'>('white');
  const [stealthMode, setStealthMode] = useState(false);

  // Document Picture-in-Picture (OS-Level Always-on-top over other Chrome tabs & apps)
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Speech Recognition (Microphone)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check Document Picture-in-Picture support
  const isPipSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Open Document Picture-in-Picture Always-On-Top Window
  const openPipOverlay = async () => {
    if (isPipSupported) {
      try {
        if (pipWindow) {
          pipWindow.close();
          setPipWindow(null);
          setPipContainer(null);
          return;
        }

        const win = await (window as any).documentPictureInPicture.requestWindow({
          width: 480,
          height: 620,
        });

        win.document.title = stealthMode ? 'Notes' : 'SvizzGPT Overlay (Always-On-Top)';

        // 1. Copy all <link rel="stylesheet"> tags (including fonts and KaTeX)
        document.head.querySelectorAll('link[rel="stylesheet"]').forEach((linkNode) => {
          win.document.head.appendChild(linkNode.cloneNode(true));
        });

        // 2. Copy all inline style tags (Vite / Tailwind rules)
        document.head.querySelectorAll('style').forEach((styleNode) => {
          win.document.head.appendChild(styleNode.cloneNode(true));
        });

        // 3. Fallback: Copy styleSheets if not already captured
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            if (!styleSheet.href) {
              const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
              const style = win.document.createElement('style');
              style.textContent = cssRules;
              win.document.head.appendChild(style);
            }
          } catch (e) {}
        });

        win.document.body.style.margin = '0';
        win.document.body.style.padding = '0';
        win.document.body.style.background = '#f9fafb';
        win.document.body.style.overflow = 'hidden';
        win.document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        const container = win.document.createElement('div');
        container.id = 'pip-overlay-root';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.overflow = 'hidden';
        win.document.body.appendChild(container);

        win.addEventListener('pagehide', () => {
          setPipWindow(null);
          setPipContainer(null);
          setIsPipMinimized(false);
        });

        setPipWindow(win);
        setPipContainer(container);
      } catch (err: any) {
        console.error('Document PiP launch error:', err);
        fallbackPopout();
      }
    } else {
      fallbackPopout();
    }
  };

  const closePipOverlay = () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      setPipContainer(null);
      setIsPipMinimized(false);
    }
  };

  const fallbackPopout = () => {
    window.open(
      window.location.href,
      'SvizzOverlay',
      'width=480,height=620,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
  };

  // Keyboard Shortcuts: Ctrl+Space / Cmd+Space / Alt+Space / Cmd+Shift+S to ALWAYS bring it back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      
      // Shortcut to toggle / bring back overlay
      if (
        (isCmdOrCtrl && e.code === 'Space') || 
        (e.altKey && e.code === 'Space') || 
        (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's')
      ) {
        e.preventDefault();
        setIsVisible(true);
        setIsMinimized(false);
        setIsPipMinimized(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        if (isVisible) {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Mouse Dragging Handlers for In-Page Overlay
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, a, label, svg')) {
      return;
    }
    setIsDragging(true);
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 120, e.clientX - dragStartOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragStartOffset.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Auto-focus input
  useEffect(() => {
    if (isVisible && !isMinimized && !isPipMinimized) {
      inputRef.current?.focus();
    }
  }, [isVisible, isMinimized, isPipMinimized]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  // Clipboard Paste Image Handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setAttachments(prev => [
              ...prev,
              {
                filename: file.name || `Pasted_Image_${Date.now()}.png`,
                file_type: 'image',
                mime_type: file.type,
                file_size: file.size || 0,
                data_url: dataUrl,
                url: dataUrl
              }
            ]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Drag and Drop Files Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files);
    }
  };

  // File Upload Helper
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setAttachments(prev => [
              ...prev,
              {
                filename: file.name,
                file_type: 'image',
                mime_type: file.type,
                file_size: file.size,
                data_url: dataUrl,
                url: dataUrl
              }
            ]);
          };
          reader.readAsDataURL(file);
        } else {
          const res = await api.uploadFile(file);
          if (res.success) {
            setAttachments(prev => [
              ...prev,
              {
                filename: res.filename,
                file_type: res.file_type,
                mime_type: res.mime_type,
                file_size: res.file_size,
                extracted_text: res.extracted_text,
                data_url: res.data_url,
                url: res.url
              }
            ]);
          }
        }
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Speech Recognition (Microphone Option)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Microphone speech recognition requires Google Chrome or Chromium.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech init error:", err);
      setIsListening(false);
    }
  };

  // Send Message (Multi-provider auto-fallback wired on backend)
  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      attachments: attachments,
      created_at: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setAttachments([]);
    setIsStreaming(true);
    setCurrentStream('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    const placeholderAsst: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      model: 'qwen/qwen3.8-27b',
      status: 'streaming',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, placeholderAsst]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: newHistory.map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments
          })),
          model: 'qwen/qwen3.8-27b',
        })
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('No stream');

      let accumulated = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.substring(6));
              if (event.type === 'token') {
                accumulated += event.data;
                setCurrentStream(accumulated);
                setMessages(prev => {
                  const copy = [...prev];
                  const lastIdx = copy.length - 1;
                  if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
                    copy[lastIdx] = { ...copy[lastIdx], content: accumulated };
                  }
                  return copy;
                });
              } else if (event.type === 'done') {
                setMessages(prev => {
                  const copy = [...prev];
                  const lastIdx = copy.length - 1;
                  if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
                    copy[lastIdx] = { ...copy[lastIdx], content: event.data || accumulated, status: 'completed' };
                  }
                  return copy;
                });
              } else if (event.type === 'error') {
                setMessages(prev => {
                  const copy = [...prev];
                  const lastIdx = copy.length - 1;
                  if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
                    copy[lastIdx] = { ...copy[lastIdx], content: `Error: ${event.data}`, status: 'error' };
                  }
                  return copy;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
            copy[lastIdx] = { ...copy[lastIdx], content: `Error: ${err.message}`, status: 'error' };
          }
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
      setCurrentStream('');
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch (err) {}
  };

  const clearChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setCurrentStream('');
  };

  // Compute container background and text styling based on transparency
  const isGhostMode = bgTransparency === 0.0;
  const isWhite = themeColor === 'white';

  const getContainerBgStyle = () => {
    if (isGhostMode) {
      return 'rgba(0, 0, 0, 0)';
    }
    if (isWhite) {
      return `rgba(255, 255, 255, ${bgTransparency})`;
    }
    return `rgba(244, 245, 247, ${bgTransparency})`;
  };

  // Reusable Overlay Box (Rendered either directly in page or inside Document PiP)
  const renderOverlayBox = (isInsidePip = false) => {
    // 1. Minimized View Inside Document Picture-in-Picture
    if (isPipMinimized && isInsidePip) {
      return (
        <div className="w-full h-full flex items-center justify-between px-3 py-2 bg-neutral-100 border-b border-neutral-300 select-none">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-neutral-600 animate-pulse" />
            <span className="font-semibold text-xs text-neutral-800">
              {stealthMode ? 'Notes' : 'SvizzGPT (Always On Top)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPipMinimized(false)}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-900 text-white rounded text-xs font-medium transition-colors"
              title="Expand overlay"
            >
              ＋ Expand
            </button>
            <button
              onClick={closePipOverlay}
              className="p-1 text-neutral-500 hover:text-neutral-800 hover:bg-black/5 rounded text-xs"
              title="Dock back to main tab"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    // 2. Minimized View In-Page (Draggable floating pill, flat, NO shadow)
    if (isMinimized && !isInsidePip) {
      return (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            background: isWhite ? '#ffffff' : '#f4f5f7'
          }}
          className="z-50 flex items-center gap-2 px-3 py-1.5 border border-neutral-300 rounded-full select-none cursor-move transition-opacity duration-150 shadow-none"
          onMouseDown={handleMouseDown}
        >
          <Move className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-xs text-neutral-800">
            {stealthMode ? 'Notes' : 'Svizz'}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">⌘/Ctrl+Space</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-black/5 rounded text-neutral-600"
            title="Expand Overlay"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    // 3. Full Expanded Overlay Box (Flat, NO shadow)
    return (
      <div 
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={
          isInsidePip
            ? { 
                width: '100%', 
                height: '100%', 
                background: getContainerBgStyle(),
                backdropFilter: isGhostMode ? 'none' : 'blur(4px)'
              }
            : {
                position: 'fixed',
                left: 0,
                top: 0,
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                width: 'min(540px, calc(100vw - 32px))',
                background: getContainerBgStyle(),
                backdropFilter: isGhostMode ? 'none' : 'blur(4px)'
              }
        }
        className={`z-50 rounded-lg border flex flex-col overflow-hidden transition-all duration-150 shadow-none ${
          isInsidePip ? 'h-full border-none rounded-none' : ''
        } ${
          isGhostMode 
            ? 'border-neutral-400/40 text-neutral-900' 
            : (isWhite ? 'border-[#e5e7eb] text-[#1f2937]' : 'border-[#d1d5db] text-[#111827]')
        } ${isDraggingFile ? 'border-2 border-dashed border-neutral-500 bg-neutral-100/50' : ''}`}
      >
        {/* Header Bar (White / Neutral Grey, Flat, Draggable) */}
        <div 
          onMouseDown={isInsidePip ? undefined : handleMouseDown}
          className={`h-9 px-3 border-b flex items-center justify-between text-xs select-none ${
            isInsidePip ? '' : 'cursor-move'
          } ${
            isGhostMode 
              ? 'border-neutral-300/40 bg-white/20 backdrop-blur-xs' 
              : (isWhite ? 'bg-white border-[#e5e7eb]' : 'bg-[#f4f5f7] border-[#d1d5db]')
          }`}
        >
          {/* Left Title & Status */}
          <div className="flex items-center gap-2">
            {!isInsidePip && <Move className="w-3.5 h-3.5 text-neutral-400" />}
            <span className="font-semibold text-xs text-neutral-800">
              {stealthMode ? 'Notes' : 'Svizz Overlay'}
            </span>
            <span className="text-neutral-300">|</span>
            <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {stealthMode ? 'ready' : (isInsidePip ? 'Always-On-Top' : 'Groq LPU')}
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 text-neutral-500">
            {/* Always-On-Top PiP Button (Sleek White/Grey) */}
            {!isInsidePip ? (
              <button
                onClick={openPipOverlay}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium border border-neutral-300 transition-colors shadow-none"
                title="Float over ALL Chrome tabs, windows & screen (Always-on-Top Document Picture-in-Picture)"
              >
                <Pin className="w-3 h-3 text-neutral-700" />
                <span>Always-On-Top</span>
              </button>
            ) : (
              <button
                onClick={closePipOverlay}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[11px] font-medium transition-colors shadow-none"
                title="Dock back to browser tab"
              >
                <ArrowDownLeft className="w-3 h-3" />
                <span>Dock</span>
              </button>
            )}

            {/* Transparency Selector (100% -> 75% -> 40% -> 0% Ghost Mode) */}
            <button
              onClick={() => {
                if (bgTransparency === 1.0) setBgTransparency(0.75);
                else if (bgTransparency === 0.75) setBgTransparency(0.40);
                else if (bgTransparency === 0.40) setBgTransparency(0.0);
                else setBgTransparency(1.0);
              }}
              className="px-1.5 py-0.5 rounded hover:bg-black/5 hover:text-neutral-800 font-mono text-[10px]"
              title="Transparency: 100% solid, 75%, 40% glass, 0% Ghost (only texts visible)"
            >
              {isGhostMode ? 'Ghost (0%)' : `${Math.round(bgTransparency * 100)}%`}
            </button>

            {/* Theme Toggle (White / Grey) */}
            <button
              onClick={() => setThemeColor(prev => prev === 'white' ? 'light-grey' : 'white')}
              className="px-1.5 py-0.5 rounded hover:bg-black/5 hover:text-neutral-800 text-[10px]"
              title="Toggle White / Light Grey background"
            >
              {isWhite ? 'White' : 'Grey'}
            </button>

            {/* Stealth Disguise Toggle */}
            <button
              onClick={() => setStealthMode(prev => !prev)}
              className="p-1 rounded hover:bg-black/5 hover:text-neutral-800"
              title="Toggle Stealth Mode (Disguises title as 'Notes')"
            >
              {stealthMode ? <EyeOff className="w-3.5 h-3.5 text-neutral-700" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {/* Minimize Button (Works both In-Page and inside PiP Always-on-Top!) */}
            <button
              onClick={() => {
                if (isInsidePip) {
                  setIsPipMinimized(true);
                } else {
                  setIsMinimized(true);
                }
              }}
              className="p-1 rounded hover:bg-black/5 hover:text-neutral-800"
              title="Minimize Overlay"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Close / Hide Button (Esc) */}
            {!isInsidePip && (
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 rounded hover:bg-black/5 hover:text-neutral-800 ml-0.5"
                title="Hide Overlay (Esc) — bring back with Ctrl+Space / Cmd+Space"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation / Output Scroll Area */}
        {messages.length > 0 && (
          <div 
            style={{ 
              maxHeight: isInsidePip ? 'calc(100vh - 130px)' : '48vh',
              background: isGhostMode ? 'transparent' : 'inherit'
            }}
            className="overflow-y-auto p-3 space-y-3 text-xs leading-relaxed border-b border-inherit flex-1"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className="group/item">
                {msg.role === 'user' ? (
                  <div className={`font-semibold flex items-start gap-1.5 pb-1 ${isGhostMode ? 'text-black drop-shadow-sm' : 'text-neutral-900'}`}>
                    <span className="text-neutral-400 font-mono text-[10px] select-none pt-0.5">Q:</span>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {/* Attached user images preview */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {msg.attachments.map((att, aIdx) => (
                            <div key={aIdx} className="border border-neutral-300 rounded p-0.5 bg-white/80">
                              {att.file_type === 'image' && (att.data_url || att.url) ? (
                                <img 
                                  src={att.data_url || att.url} 
                                  alt={att.filename} 
                                  className="h-16 w-auto object-cover rounded" 
                                />
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 text-neutral-600">
                                  📄 {att.filename}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`p-2.5 rounded border relative ${
                    isGhostMode 
                      ? 'bg-white/30 border-neutral-300/60 backdrop-blur-xs text-neutral-950 font-medium' 
                      : 'bg-black/[0.02] border-black/[0.05]'
                  }`}>
                    <div className="overlay-prose">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Action Bar (Copy) */}
                    <div className="mt-2 pt-1.5 border-t border-black/[0.05] flex items-center justify-between text-[10px] text-neutral-400 select-none">
                      <span className="font-mono">
                        {msg.status === 'streaming' ? 'Generating...' : 'Done'}
                      </span>
                      <button
                        onClick={() => copyMessage(msg.content, idx)}
                        className="flex items-center gap-1 hover:text-neutral-700 p-0.5"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Attachment preview if files/images pasted or dragged */}
        {attachments.length > 0 && (
          <div className={`p-2 border-b border-inherit flex flex-wrap gap-2 text-[11px] font-mono ${
            isGhostMode ? 'bg-white/20' : 'bg-inherit'
          }`}>
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-neutral-200 rounded text-neutral-800">
                {att.file_type === 'image' && (att.data_url || att.url) ? (
                  <img src={att.data_url || att.url} alt={att.filename} className="w-6 h-6 object-cover rounded" />
                ) : (
                  <Paperclip className="w-3 h-3 text-neutral-400" />
                )}
                <span className="truncate max-w-[120px] text-[10px]">{att.filename}</span>
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Prompt Input Line */}
        <div className={`p-2.5 flex items-end gap-1.5 shrink-0 ${
          isGhostMode ? 'bg-white/20' : 'bg-inherit'
        }`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening to your voice..." : "Type, paste image (Ctrl+V), or drag file here..."}
            rows={1}
            className={`flex-1 bg-transparent border-0 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none resize-none leading-relaxed py-1 ${
              isGhostMode ? 'placeholder-neutral-600 font-medium' : ''
            }`}
          />

          {/* Voice Microphone Button */}
          <button
            onClick={toggleSpeechRecognition}
            className={`p-1.5 rounded transition-colors shrink-0 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'text-neutral-400 hover:text-neutral-700 hover:bg-black/5'
            }`}
            title={isListening ? "Click to stop listening" : "Click to speak into microphone"}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          {/* Image & File Upload Button */}
          <label 
            className="p-1.5 rounded hover:bg-black/5 text-neutral-400 hover:text-neutral-700 cursor-pointer shrink-0"
            title="Attach image or file (or paste/drag into box)"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <input
              type="file"
              accept="image/*,.pdf,.txt,.md,.py,.js,.json"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 rounded hover:bg-black/5 text-neutral-400 hover:text-neutral-700 shrink-0"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isStreaming}
            className="p-1.5 bg-neutral-900 hover:bg-black disabled:opacity-30 text-white rounded shrink-0 transition-colors shadow-none"
            title="Send"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Minimal Footer Info */}
        <div className={`px-3 py-1 border-t border-inherit flex items-center justify-between text-[10px] text-neutral-400 font-mono select-none shrink-0 ${
          isGhostMode ? 'bg-transparent text-neutral-500' : 'bg-black/[0.02]'
        }`}>
          <span>Shortcut: [⌘/Ctrl+Space] brings it back | Drag top bar</span>
          <span>{isListening ? '🎤 Listening...' : (isUploading ? 'Uploading...' : 'Enter sends')}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. If Document Picture-in-Picture window is active: Portal overlay into that window */}
      {pipContainer && pipWindow ? (
        <>
          {ReactDOM.createPortal(renderOverlayBox(true), pipContainer)}

          {/* Clean White/Grey Status Display in Original Browser Tab */}
          <div className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-neutral-50/70">
            <div className="max-w-md p-6 bg-white border border-neutral-300 rounded-lg shadow-none flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="font-semibold text-neutral-800 text-sm">
                SvizzGPT is Floating Over Your Screen & All Chrome Tabs
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                The overlay is pinned always-on-top over all other Chrome tabs, windows, and apps.
                You can drag it anywhere, minimize it, or resize it freely.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={closePipOverlay}
                  className="px-4 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-black transition-colors shadow-none"
                >
                  Dock Back to This Tab
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 2. Regular In-Page Overlay */
        <>
          {/* Top Banner Guide (Clean White/Grey, Flat, No Shadows) */}
          <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1 bg-white border border-neutral-300 rounded-full text-xs text-neutral-700 select-none shadow-none">
            <span className="font-medium text-neutral-800">SvizzGPT Screen Overlay</span>
            <span className="text-neutral-300">|</span>
            <button
              onClick={openPipOverlay}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium text-[11px] border border-neutral-300 transition-colors shadow-none"
            >
              <Pin className="w-3 h-3 text-neutral-700" />
              <span>Float Over All Chrome Tabs & Screen</span>
            </button>
          </div>

          {isVisible && renderOverlayBox(false)}
        </>
      )}

      {/* When hidden or minimized: Discreet trigger in bottom corner to bring it back */}
      {(!isVisible || isMinimized) && !pipWindow && (
        <div 
          onClick={() => { setIsVisible(true); setIsMinimized(false); }}
          className="fixed bottom-3 right-3 z-50 px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-mono border border-neutral-300 rounded-full cursor-pointer select-none transition-all flex items-center gap-1.5 shadow-none"
          title="Click or press Ctrl+Space / Cmd+Space to bring back overlay"
        >
          <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
          <span>Svizz [⌘/Ctrl+Space]</span>
        </div>
      )}
    </>
  );
};
