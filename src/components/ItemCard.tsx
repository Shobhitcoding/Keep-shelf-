import React, { useState } from 'react';
import { 
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
  Check, 
  Eye, 
  Calendar,
  MoreVertical
} from 'lucide-react';
import { InboxItem } from '../types';

interface ItemCardProps {
  item: InboxItem;
  layoutMode: 'grid' | 'list';
  onSelect: (item: InboxItem) => void;
  onEdit: (item: InboxItem) => void;
  onToggleArchive: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  layoutMode,
  onSelect,
  onEdit,
  onToggleArchive,
  onTogglePin,
  onDelete,
  onTagClick,
  onCopyText,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatRelativeDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return 'Recently';
    }
  };

  const formattedFullDate = new Date(item.updatedAt || item.createdAt).toLocaleString();

  const getDomainFromUrl = (urlStr?: string) => {
    if (!urlStr) return '';
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return urlStr;
    }
  };

  const imageSrc = item.imageData || item.url;

  // In List View
  if (layoutMode === 'list') {
    return (
      <div 
        className={`group relative bg-white border rounded-xl p-4 transition-all hover:shadow-md ${
          item.isPinned ? 'border-amber-300/80 bg-amber-50/20 shadow-xs' : 'border-stone-200'
        } ${item.isArchived ? 'opacity-85' : ''}`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left item details */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon / thumbnail */}
            <div className="shrink-0 mt-0.5">
              {item.type === 'note' && (
                <div className="w-10 h-10 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              {item.type === 'link' && (
                <div className="w-10 h-10 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5" />
                </div>
              )}
              {item.type === 'image' && (
                <div className="w-10 h-10 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center overflow-hidden border border-emerald-200/50">
                  {imageSrc && !imageError ? (
                    <img 
                      src={imageSrc} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="font-semibold text-stone-900 hover:text-amber-700 text-sm text-left truncate hover:underline"
                >
                  {item.title}
                </button>

                {item.isPinned && !item.isArchived && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                    <Pin className="w-2.5 h-2.5 fill-amber-700" /> Pinned
                  </span>
                )}
                {item.isArchived && (
                  <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                    Archived
                  </span>
                )}
              </div>

              {/* Subtitle / summary */}
              {item.type === 'link' && item.url && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 mb-1 font-mono truncate">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                    {getDomainFromUrl(item.url)}
                  </a>
                </div>
              )}

              {item.content && (
                <p className="text-xs text-stone-600 line-clamp-1 mb-2">
                  {item.content}
                </p>
              )}

              {/* Tags & timestamp */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-stone-400">
                <span title={`Saved: ${formattedFullDate}`} className="text-[11px] text-stone-400">
                  {formatRelativeDate(item.updatedAt || item.createdAt)}
                </span>

                {item.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagClick(tag);
                        }}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {!item.isArchived && (
              <button
                type="button"
                onClick={() => onTogglePin(item.id)}
                title={item.isPinned ? 'Unpin from top' : 'Pin to top'}
                className={`p-1.5 rounded-lg transition-colors ${
                  item.isPinned ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Pin className={`w-4 h-4 ${item.isPinned ? 'fill-amber-600' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelect(item)}
              title="View Details"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              title="Edit Item"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onToggleArchive(item.id)}
              title={item.isArchived ? 'Restore to inbox' : 'Archive item'}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {item.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>

            {showConfirmDelete ? (
              <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-lg border border-red-200">
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="px-2 py-0.5 text-xs font-bold text-red-700 hover:bg-red-100 rounded"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-1.5 py-0.5 text-xs text-stone-500 hover:bg-stone-200 rounded"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                title="Delete item"
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      className={`group relative flex flex-col justify-between bg-white border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-stone-300 ${
        item.isPinned ? 'border-amber-300/80 ring-1 ring-amber-200/50 bg-linear-to-b from-amber-50/20 to-white' : 'border-stone-200'
      } ${item.isArchived ? 'opacity-90 bg-stone-50/50' : ''}`}
    >
      {/* Top Banner or Image Preview */}
      {item.type === 'image' && (
        <div 
          onClick={() => onSelect(item)} 
          className="relative w-full h-44 bg-stone-100 overflow-hidden cursor-pointer border-b border-stone-100"
        >
          {imageSrc && !imageError ? (
            <img
              src={imageSrc}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs">Image unavailable</span>
            </div>
          )}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <ImageIcon className="w-2.5 h-2.5" /> Image
            </span>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row with type badge & pin button */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.type === 'note' && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  <FileText className="w-3 h-3 text-amber-700" /> Note
                </span>
              )}
              {item.type === 'link' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  <LinkIcon className="w-3 h-3 text-blue-700" /> Link
                </span>
              )}

              {item.isPinned && !item.isArchived && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-md">
                  <Pin className="w-2.5 h-2.5 fill-amber-700 text-amber-700" /> Pinned
                </span>
              )}
              {item.isArchived && (
                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md">
                  Archived
                </span>
              )}
            </div>

            {/* Pin quick toggle */}
            {!item.isArchived && (
              <button
                type="button"
                onClick={() => onTogglePin(item.id)}
                title={item.isPinned ? 'Unpin' : 'Pin to top'}
                className={`p-1 rounded-md transition-colors ${
                  item.isPinned ? 'text-amber-600 bg-amber-100/60' : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-amber-600' : ''}`} />
              </button>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(item)}
            className="font-bold text-stone-900 text-base leading-snug line-clamp-2 hover:text-amber-700 cursor-pointer mb-1.5"
          >
            {item.title}
          </h3>

          {/* Link URL preview if type is link */}
          {item.type === 'link' && item.url && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50/60 border border-blue-100 rounded-lg p-2 mb-2 font-mono truncate">
              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="truncate hover:underline"
              >
                {getDomainFromUrl(item.url)}
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyText(item.url!, 'Link URL');
                }}
                title="Copy link"
                className="ml-auto p-0.5 text-blue-500 hover:text-blue-800 rounded"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Content snippet */}
          {item.content && (
            <p 
              onClick={() => onSelect(item)}
              className="text-xs text-stone-600 line-clamp-3 leading-relaxed whitespace-pre-line mb-3 cursor-pointer"
            >
              {item.content}
            </p>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mb-3">
              {item.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer: Timestamp & Action buttons */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
          <span title={`Updated: ${formattedFullDate}`} className="text-[11px]">
            {formatRelativeDate(item.updatedAt || item.createdAt)}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onSelect(item)}
              title="View Details"
              className="p-1.5 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              title="Edit Item"
              className="p-1.5 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onToggleArchive(item.id)}
              title={item.isArchived ? 'Restore to Inbox' : 'Archive Item'}
              className="p-1.5 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            >
              {item.isArchived ? (
                <ArchiveRestore className="w-3.5 h-3.5 text-stone-600" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
            </button>

            {showConfirmDelete ? (
              <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded border border-red-200">
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="px-1.5 py-0.5 text-[11px] font-bold text-red-700 hover:bg-red-100 rounded"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-1 py-0.5 text-[11px] text-stone-500 rounded"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                title="Delete Item"
                className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
