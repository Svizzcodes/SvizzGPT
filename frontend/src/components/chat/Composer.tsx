import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Globe, Image as ImageIcon, FileText, Square, Paperclip } from 'lucide-react';
import { Attachment, ModelOption } from '../../lib/types';
import { AttachmentPreview } from './AttachmentPreview';
import { AVAILABLE_MODELS } from '../../lib/constants';
import { api } from '../../lib/api';

interface ComposerProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  onStopGeneration?: () => void;
  isStreaming: boolean;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  initialPrompt?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  selectedModel,
  onSelectModel,
  webSearchEnabled,
  onToggleWebSearch,
  initialPrompt = ''
}) => {
  const [content, setContent] = useState(initialPrompt);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setContent(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPrompt]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if ((content.trim() === '' && attachments.length === 0) || isStreaming) return;
    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setShowAttachMenu(false);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Failed to upload'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 select-none">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border transition-all duration-200 bg-zinc-950/90 ${
          isDragging 
            ? 'border-svizz-accent shadow-[0_0_20px_var(--svizz-glow)]' 
            : 'border-svizz-border focus-within:border-svizz-accent/80'
        }`}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 font-mono text-xs text-svizz-accent">
            <span>[DROP FILES TO ATTACH TO SVIZZGPT]</span>
          </div>
        )}

        {/* Attachment chips */}
        <div className="px-3 pt-2">
          <AttachmentPreview
            attachments={attachments}
            onRemove={(idx) => setAttachments(prev => prev.filter((_, i) => i !== idx))}
          />
        </div>

        {/* Text Input */}
        <div className="px-3 py-2 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              attachments.length > 0 
                ? "Ask anything about your attached images or documents..." 
                : "Type message or /image <prompt>... (Shift+Enter for newline)"
            }
            rows={1}
            disabled={isStreaming}
            className="w-full bg-transparent text-svizz-text placeholder-zinc-500 text-sm focus:outline-none resize-none font-sans leading-relaxed py-1"
          />

          {/* Send or Stop Action */}
          {isStreaming ? (
            <button
              onClick={onStopGeneration}
              className="p-2 bg-rose-950/80 border border-rose-500/60 text-rose-300 hover:bg-rose-900 transition-colors shrink-0 font-mono text-xs flex items-center gap-1"
              title="Stop Generation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-bold">STOP</span>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={content.trim() === '' && attachments.length === 0}
              className="p-2 bg-svizz-accent text-black hover:bg-svizz-accentHover disabled:opacity-30 disabled:hover:bg-svizz-accent transition-all shrink-0 font-mono text-xs"
              title="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="px-3 py-2 border-t border-svizz-border/40 flex items-center justify-between font-mono text-[11px] text-svizz-muted bg-black/40">
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="flex items-center gap-1 px-2 py-1 border border-svizz-border hover:border-svizz-accent hover:text-svizz-text transition-colors"
                title="Attach image, PDF, or code"
              >
                <Plus className="w-3 h-3 text-svizz-accent" />
                <span>ATTACH</span>
              </button>

              {/* Attach Dropdown Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-950 border border-svizz-border shadow-xl p-1 z-30 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
                  <label className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-900 hover:text-svizz-accent cursor-pointer text-svizz-text">
                    <ImageIcon className="w-3.5 h-3.5 text-svizz-accent" />
                    <span>Upload Image (Vision)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </label>
                  <label className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-900 hover:text-svizz-accent cursor-pointer text-svizz-text">
                    <FileText className="w-3.5 h-3.5 text-svizz-accent" />
                    <span>Upload PDF / Document</span>
                    <input
                      type="file"
                      accept=".pdf,.txt,.csv,.json,.md,.py,.js,.ts,.tsx"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Web Search Toggle */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              className={`flex items-center gap-1 px-2 py-1 border transition-colors ${
                webSearchEnabled 
                  ? 'border-svizz-accent text-svizz-accent bg-svizz-accent-muted font-bold' 
                  : 'border-svizz-border text-svizz-muted hover:text-svizz-text'
              }`}
              title="Toggle Live Web Search Citations"
            >
              <Globe className="w-3 h-3" />
              <span>WEB: {webSearchEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {isUploading && (
              <span className="text-[10px] text-svizz-accent animate-pulse font-mono">
                [UPLOADING & EXTRACTING...]
              </span>
            )}
          </div>

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] opacity-60">MODEL:</span>
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="bg-black border border-svizz-border text-svizz-text px-1.5 py-0.5 text-[10px] font-mono focus:outline-none focus:border-svizz-accent cursor-pointer uppercase"
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.tag})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
