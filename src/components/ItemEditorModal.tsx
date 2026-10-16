import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Pin, 
  Archive, 
  AlertCircle,
  Check,
  Sparkles,
  Trash2
} from 'lucide-react';
import { InboxItem, ItemType } from '../types';
import { compressImageFile, normalizeUrl, isValidUrl } from '../storage';

interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: {
    id?: string;
    type: ItemType;
    title: string;
    content?: string;
    url?: string;
    imageData?: string;
    tags: string[];
    isArchived: boolean;
    isPinned: boolean;
  }) => void;
  existingItem?: InboxItem | null;
  suggestedTags: string[];
}

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingItem,
  suggestedTags,
}) => {
  const [type, setType] = useState<ItemType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form when modal opens or item changes
  useEffect(() => {
    if (isOpen) {
      if (existingItem) {
        setType(existingItem.type);
        setTitle(existingItem.title || '');
        setContent(existingItem.content || '');
        setUrl(existingItem.url || '');
        setImageData(existingItem.imageData);
        if (existingItem.type === 'image' && existingItem.url && !existingItem.imageData) {
          setImageSourceMode('url');
          setImageUrlInput(existingItem.url);
        } else {
          setImageSourceMode('upload');
          setImageUrlInput('');
        }
        setTags([...existingItem.tags]);
        setIsArchived(existingItem.isArchived);
        setIsPinned(existingItem.isPinned ?? false);
      } else {
        // Defaults for new item
        setType('note');
        setTitle('');
        setContent('');
        setUrl('');
        setImageData(undefined);
        setImageSourceMode('upload');
        setImageUrlInput('');
        setTags([]);
        setIsArchived(false);
        setIsPinned(false);
      }
      setTagInput('');
      setErrorMsg(null);

      // Focus title after short timeout
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, existingItem]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Add a tag safely
  const handleAddTag = (rawTag: string) => {
    const cleaned = rawTag
      .replace(/^#+/, '')
      .trim()
      .toLowerCase();
    
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Handle image file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Selected file must be an image (JPEG, PNG, WebP, GIF).');
      return;
    }

    try {
      setIsCompressing(true);
      setErrorMsg(null);
      const compressedDataUrl = await compressImageFile(file);
      setImageData(compressedDataUrl);

      // If title is currently empty, use file name
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process image. Please try a different image.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle form submission with robust validation & fallback for empty/unusual inputs
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let finalTitle = title.trim();
    let finalUrl = url.trim();
    let finalContent = content.trim();
    let finalImageData = imageData;

    // Handle Type-specific validations
    if (type === 'link') {
      if (!finalUrl) {
        setErrorMsg('Please enter a website URL for the link.');
        return;
      }
      finalUrl = normalizeUrl(finalUrl);
      if (!isValidUrl(finalUrl)) {
        setErrorMsg('Please enter a valid web URL (e.g. https://example.com).');
        return;
      }
      // If title is empty, generate title from URL host
      if (!finalTitle) {
        try {
          const u = new URL(finalUrl);
          finalTitle = u.hostname.replace(/^www\./, '');
        } catch {
          finalTitle = finalUrl;
        }
      }
    } else if (type === 'image') {
      if (imageSourceMode === 'url') {
        const cleanImgUrl = normalizeUrl(imageUrlInput.trim());
        if (!cleanImgUrl || !isValidUrl(cleanImgUrl)) {
          setErrorMsg('Please provide a valid image URL.');
          return;
        }
        finalUrl = cleanImgUrl;
        finalImageData = undefined;
      } else {
        if (!finalImageData) {
          setErrorMsg('Please upload an image file or switch to Image URL mode.');
          return;
        }
      }

      if (!finalTitle) {
        finalTitle = 'Saved Image ' + new Date().toLocaleDateString();
      }
    } else {
      // Note type
      if (!finalTitle && !finalContent) {
        setErrorMsg('Please enter a note title or content.');
        return;
      }
      // Fallback: If title is empty but content exists, use the first line of content
      if (!finalTitle && finalContent) {
        const firstLine = finalContent.split('\n')[0].trim();
        finalTitle = firstLine.length > 50 ? firstLine.slice(0, 47) + '...' : firstLine;
      }
    }

    onSave({
      id: existingItem?.id,
      type,
      title: finalTitle || 'Untitled Item',
      content: finalContent || undefined,
      url: finalUrl || undefined,
      imageData: finalImageData,
      tags,
      isArchived,
      isPinned,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
          <div>
            <h2 className="font-bold text-stone-900 text-lg sm:text-xl">
              {existingItem ? 'Edit Item' : 'Create New Saved Item'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Saved instantly to your local browser storage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Selector (Note, Link, Image) */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Item Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('note')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  type === 'note'
                    ? 'border-amber-600 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <FileText className={`w-4 h-4 ${type === 'note' ? 'text-amber-600' : 'text-stone-400'}`} />
                <span>Note</span>
              </button>

              <button
                type="button"
                onClick={() => setType('link')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  type === 'link'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <LinkIcon className={`w-4 h-4 ${type === 'link' ? 'text-blue-600' : 'text-stone-400'}`} />
                <span>Link</span>
              </button>

              <button
                type="button"
                onClick={() => setType('image')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  type === 'image'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <ImageIcon className={`w-4 h-4 ${type === 'image' ? 'text-emerald-600' : 'text-stone-400'}`} />
                <span>Image</span>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="item-title" className="block text-xs font-bold text-stone-700">
                Title {type === 'note' ? '(Optional if text provided)' : ''}
              </label>
              <span className="text-[11px] text-stone-400 font-normal">
                {title.length}/100
              </span>
            </div>
            <input
              ref={titleInputRef}
              id="item-title"
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'note'
                  ? 'e.g., Weekly grocery checklist'
                  : type === 'link'
                  ? 'e.g., React Documentation'
                  : 'e.g., Architecture diagram screenshot'
              }
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
            />
          </div>

          {/* Link URL input (if type is link) */}
          {type === 'link' && (
            <div>
              <label htmlFor="link-url" className="block text-xs font-bold text-stone-700 mb-1.5">
                Website URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="link-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full pl-3.5 pr-20 py-2.5 text-sm font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.readText?.().then((clip) => {
                      if (clip) setUrl(clip);
                    }).catch(() => {});
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-stone-200 hover:bg-stone-300 text-stone-700 px-2.5 py-1 rounded-md font-medium"
                >
                  Paste
                </button>
              </div>
            </div>
          )}

          {/* Image source input (if type is image) */}
          {type === 'image' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setImageSourceMode('upload')}
                  className={`font-semibold pb-1 border-b-2 transition-colors ${
                    imageSourceMode === 'upload'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode('url')}
                  className={`font-semibold pb-1 border-b-2 transition-colors ${
                    imageSourceMode === 'url'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Web Image URL
                </button>
              </div>

              {imageSourceMode === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {imageData ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-stone-100 max-h-56 flex items-center justify-center group">
                      <img
                        src={imageData}
                        alt="Preview"
                        className="max-h-56 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setImageData(undefined)}
                        className="absolute top-2 right-2 bg-stone-900/80 hover:bg-red-600 text-white p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-stone-50 hover:bg-emerald-50/20"
                    >
                      <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-stone-700">
                        {isCompressing ? 'Compressing image...' : 'Click to select or upload an image'}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        PNG, JPG, WebP, GIF (Automatically compressed for instant local storage)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {imageUrlInput && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 max-h-48 flex items-center justify-center">
                      <img
                        src={normalizeUrl(imageUrlInput)}
                        alt="URL Preview"
                        className="max-h-48 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content / Notes textarea */}
          <div>
            <label htmlFor="item-content" className="block text-xs font-bold text-stone-700 mb-1.5">
              {type === 'note' ? 'Note Content' : 'Optional Notes / Description'}
            </label>
            <textarea
              id="item-content"
              rows={type === 'note' ? 6 : 3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'note'
                  ? 'Write your note, checklist, or ideas here...'
                  : 'Add any thoughts, summary, or details about this item...'
              }
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-normal leading-relaxed"
            />
          </div>

          {/* Tags management */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">#</span>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Type a tag & press Enter (e.g. project, read-later)"
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Currently assigned tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-amber-100/70 border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-lg font-medium"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-amber-700 hover:text-amber-950 p-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested existing tags from database */}
            {suggestedTags.length > 0 && (
              <div className="mt-2 text-xs">
                <span className="text-stone-400 font-medium">Quick suggestions: </span>
                <div className="inline-flex items-center gap-1 flex-wrap mt-1">
                  {suggestedTags
                    .filter((st) => !tags.includes(st))
                    .slice(0, 8)
                    .map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleAddTag(st)}
                        className="text-[11px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium transition-colors"
                      >
                        +{st}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick flags (Pin, Archive) */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-6 text-xs text-stone-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
              />
              <span className="font-medium flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 text-amber-600" /> Pin to top
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                className="w-4 h-4 text-stone-600 rounded border-stone-300 focus:ring-stone-500"
              />
              <span className="font-medium flex items-center gap-1">
                <Archive className="w-3.5 h-3.5 text-stone-500" /> Save directly to Archive
              </span>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 text-xs sm:text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCompressing}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{existingItem ? 'Save Changes' : 'Save Item'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
