import React from 'react';
import { FileText, Image as ImageIcon, Code, X, FileSpreadsheet } from 'lucide-react';
import { Attachment } from '../../lib/types';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove?: (index: number) => void;
  readOnly?: boolean;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onRemove,
  readOnly = false
}) => {
  if (!attachments || attachments.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-svizz-accent" />;
      case 'data': return <FileSpreadsheet className="w-3.5 h-3.5 text-svizz-accent" />;
      case 'code': return <Code className="w-3.5 h-3.5 text-svizz-accent" />;
      default: return <FileText className="w-3.5 h-3.5 text-svizz-accent" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {attachments.map((att, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-950/90 border border-svizz-border text-svizz-text font-mono text-xs select-none max-w-xs group"
        >
          {att.data_url || (att.file_type === 'image' && att.url) ? (
            <img
              src={att.data_url || att.url}
              alt={att.filename}
              className="w-5 h-5 object-cover border border-svizz-border"
            />
          ) : (
            getIcon(att.file_type)
          )}

          <div className="flex flex-col min-w-0">
            <span className="truncate max-w-[140px] text-[11px] font-medium">
              {att.filename}
            </span>
            <span className="text-[9px] text-svizz-muted">
              {formatSize(att.file_size)}
            </span>
          </div>

          {!readOnly && onRemove && (
            <button
              onClick={() => onRemove(idx)}
              className="p-0.5 text-svizz-muted hover:text-rose-400 transition-colors ml-1"
              title="Remove attachment"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
