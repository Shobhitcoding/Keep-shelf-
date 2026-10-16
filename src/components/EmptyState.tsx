import React from 'react';
import { 
  Inbox, 
  Archive, 
  Search, 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon 
} from 'lucide-react';
import { ItemType, ViewMode } from '../types';

interface EmptyStateProps {
  viewMode: ViewMode;
  selectedType: ItemType | 'all';
  selectedTag: string | null;
  searchQuery: string;
  onClearFilters: () => void;
  onCreateNew: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  viewMode,
  selectedType,
  selectedTag,
  searchQuery,
  onClearFilters,
  onCreateNew,
}) => {
  const isFiltering = selectedType !== 'all' || selectedTag !== null || Boolean(searchQuery);

  if (isFiltering) {
    return (
      <div className="py-16 px-4 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
        <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-800">
          No matching items found
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
          Try adjusting your search terms or clearing your type and tag filters.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  if (viewMode === 'archived') {
    return (
      <div className="py-16 px-4 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3">
          <Archive className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-800">
          Your archive is empty
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
          When you finish with items in your inbox, archive them to keep your workspace clean while keeping them accessible.
        </p>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-stone-900">
        Your Inbox is clear
      </h3>
      <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
        Start saving notes, bookmarking links, or storing images. Everything is stored locally on this device.
      </p>

      <button
        type="button"
        onClick={onCreateNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add your first item</span>
      </button>
    </div>
  );
};
