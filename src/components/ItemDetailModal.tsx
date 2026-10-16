import React, { useEffect } from 'react';
import { 
  X, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Pin, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Copy, 
  Calendar,
  Clock,
  Tag,
  Hash,
  Download
} from 'lucide-react';
import { InboxItem } from '../types';

interface ItemDetailModalProps {
  item: InboxItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: InboxItem) => void;
  onToggleArchive: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onToggleArchive,
  onTogglePin,
  onDelete,
  onTagClick,
  onCopyText,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const imageSrc = item.imageData || item.url;
  const createdDate = new Date(item.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const updatedDate = new Date(item.updatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between gap-3 bg-stone-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            {item.type === 'note' && (
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 text-amber-700" /> Note
              </span>
            )}
            {item.type === 'link' && (
              <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <LinkIcon className="w-3.5 h-3.5 text-blue-700" /> Web Link
              </span>
            )}
            {item.type === 'image' && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-700" /> Image
              </span>
            )}

            {item.isPinned && !item.isArchived && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-xs font-medium">
                <Pin className="w-3 h-3 fill-amber-700 text-amber-700" /> Pinned
              </span>
            )}

            {item.isArchived ? (
              <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-xs font-medium">
                <Archive className="w-3 h-3" /> In Archive
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-xs font-medium">
                Active in Inbox
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
              {item.title}
            </h2>
          </div>

          {/* Type specific content: Image preview */}
          {item.type === 'image' && imageSrc && (
            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50 max-h-[420px] flex items-center justify-center relative group">
              <img
                src={imageSrc}
                alt={item.title}
                className="max-h-[420px] w-auto max-w-full object-contain mx-auto"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <a
                  href={imageSrc}
                  download={`${item.title || 'saved-image'}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-black/75 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 backdrop-blur-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Open / Download
                </a>
              </div>
            </div>
          )}

          {/* Type specific content: Link box */}
          {item.type === 'link' && item.url && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block mb-1">
                  Destination URL
                </span>
                <p className="text-sm font-mono text-blue-900 break-all select-all">
                  {item.url}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onCopyText(item.url!, 'URL')}
                  className="p-2 rounded-lg bg-white text-stone-700 hover:text-stone-900 border border-blue-200 text-xs font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Link</span>
                </a>
              </div>
            </div>
          )}

          {/* Content / Body Notes */}
          {item.content && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {item.type === 'note' ? 'Note Content' : 'Notes / Description'}
                </span>
                <button
                  type="button"
                  onClick={() => onCopyText(item.content!, 'Content')}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy text</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800 text-sm leading-relaxed whitespace-pre-wrap select-text">
                {item.content}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onTagClick(tag);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                  >
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metadata info grid */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Created: <strong className="text-stone-700 font-medium">{createdDate}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Last updated: <strong className="text-stone-700 font-medium">{updatedDate}</strong></span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 font-mono text-[11px] text-stone-400">
              <Hash className="w-3 h-3 text-stone-400" />
              <span>ID: {item.id}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleArchive(item.id)}
              className="px-3 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {item.isArchived ? (
                <>
                  <ArchiveRestore className="w-4 h-4 text-stone-600" />
                  <span>Restore to Inbox</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 text-stone-600" />
                  <span>Archive Item</span>
                </>
              )}
            </button>

            {!item.isArchived && (
              <button
                type="button"
                onClick={() => onTogglePin(item.id)}
                className={`px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-xs transition-colors ${
                  item.isPinned
                    ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Pin className={`w-4 h-4 ${item.isPinned ? 'fill-amber-600 text-amber-600' : 'text-stone-600'}`} />
                <span>{item.isPinned ? 'Unpin' : 'Pin to Top'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
