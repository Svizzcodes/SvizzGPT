import React, { useState } from 'react';
import { User, Edit3, Check, X } from 'lucide-react';
import { Message, Attachment } from '../../lib/types';
import { AttachmentPreview } from './AttachmentPreview';

interface UserMessageProps {
  message: Message;
  onEdit?: (newContent: string) => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSave = () => {
    if (onEdit && editContent.trim() !== '') {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className="w-full py-4 border-b border-svizz-border/30 group">
      <div className="max-w-4xl mx-auto flex items-start gap-3 sm:gap-4 px-4 sm:px-6">
        {/* User Monogram */}
        <div className="w-6 h-6 border border-svizz-border bg-black/80 flex items-center justify-center font-mono text-[10px] text-svizz-accent shrink-0 mt-0.5 select-none font-bold">
          U//
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-svizz-muted tracking-widest uppercase">
              YOU
            </span>

            {onEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-svizz-muted hover:text-svizz-accent p-1 text-xs flex items-center gap-1 font-mono"
                title="Edit message"
              >
                <Edit3 className="w-3 h-3" />
                <span className="text-[10px]">EDIT</span>
              </button>
            )}
          </div>

          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <AttachmentPreview attachments={message.attachments} readOnly />
          )}

          {isEditing ? (
            <div className="mt-2 space-y-2 font-mono">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 bg-black/90 border border-svizz-accent text-svizz-text text-sm focus:outline-none resize-none font-sans"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-2.5 py-1 border border-svizz-border text-[11px] text-svizz-muted hover:text-svizz-text flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> CANCEL
                </button>
                <button
                  onClick={handleSave}
                  className="px-2.5 py-1 bg-svizz-accent text-black font-bold text-[11px] flex items-center gap-1 hover:bg-svizz-accent-hover"
                >
                  <Check className="w-3 h-3" /> SAVE & RESEND
                </button>
              </div>
            </div>
          ) : (
            <p className="text-svizz-text text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
              {message.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
