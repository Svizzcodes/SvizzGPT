import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Upload, Globe, Square, FileCode } from 'lucide-react';
import { Attachment } from '../../lib/types';
import { AttachmentPreview } from '../chat/AttachmentPreview';
import { api } from '../../lib/api';

interface ColabPromptBarProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  onStopGeneration?: () => void;
  isStreaming: boolean;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
}

export const ColabPromptBar: React.FC<ColabPromptBarProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  webSearchEnabled,
  onToggleWebSearch
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [content]);

  const handleRun = () => {
    if ((content.trim() === '' && attachments.length === 0) || isStreaming) return;
    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.shiftKey || !e.ctrlKey)) {
      if (e.shiftKey) {
        e.preventDefault();
        handleRun();
      }
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
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
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 px-2 select-none">
      {/* Colab Add Buttons Bar */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => textareaRef.current?.focus()}
          className="flex items-center gap-1.5 px-3 py-1 bg-[var(--colab-surface)] hover:bg-[var(--colab-surface-hover)] border border-[var(--colab-border)] text-[var(--colab-text)] rounded text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--colab-orange)]" />
          <span>Code</span>
        </button>

        <button
          onClick={() => textareaRef.current?.focus()}
          className="flex items-center gap-1.5 px-3 py-1 bg-[var(--colab-surface)] hover:bg-[var(--colab-surface-hover)] border border-[var(--colab-border)] text-[var(--colab-text)] rounded text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--colab-orange)]" />
          <span>Text</span>
        </button>
      </div>

      {/* Active Code Cell Input */}
      <div className="border border-[var(--colab-orange)] bg-[var(--colab-surface)] rounded shadow-md overflow-hidden">
        {/* Attachment preview chips */}
        {attachments.length > 0 && (
          <div className="px-3 pt-2">
            <AttachmentPreview
              attachments={attachments}
              onRemove={(idx) => setAttachments(prev => prev.filter((_, i) => i !== idx))}
            />
          </div>
        )}

        <div className="flex items-start p-2.5 gap-2.5">
          {/* Circular Play / Stop Run Button */}
          <div className="pt-0.5 shrink-0">
            {isStreaming ? (
              <button
                onClick={onStopGeneration}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Interrupt Execution"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleRun}
                disabled={content.trim() === '' && attachments.length === 0}
                className="w-7 h-7 rounded-full bg-[var(--colab-orange)] hover:bg-[#e37400] disabled:opacity-40 text-black flex items-center justify-center transition-colors shadow-sm"
                title="Run cell (Shift+Enter)"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            )}
          </div>

          {/* Prompt / Code Input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, debug code, or enter Python query... (Press Shift+Enter to run)"
              rows={2}
              className="w-full bg-transparent text-[var(--colab-text)] placeholder-[var(--colab-text-muted)] text-[13px] font-mono focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Cell Bottom Action Bar */}
        <div className="px-3 py-1.5 bg-[var(--colab-bg)] border-t border-[var(--colab-border)] flex items-center justify-between text-[11px] text-[var(--colab-text-muted)] font-mono">
          <div className="flex items-center gap-3">
            {/* File upload input */}
            <label className="flex items-center gap-1 hover:text-[var(--colab-text)] cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[var(--colab-orange)]" />
              <span>{isUploading ? 'Uploading...' : 'Attach Image/File'}</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </label>

            {/* Web Search Toggle */}
            <button
              onClick={onToggleWebSearch}
              className={`flex items-center gap-1 hover:text-[var(--colab-text)] ${
                webSearchEnabled ? 'text-[var(--colab-orange)] font-semibold' : ''
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web search: {webSearchEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="text-[10px] text-[var(--colab-text-muted)]">
            Shift + Enter to Run
          </div>
        </div>
      </div>
    </div>
  );
};
