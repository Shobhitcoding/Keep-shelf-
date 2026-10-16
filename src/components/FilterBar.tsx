import React from 'react';
import { 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Layers, 
  Tag as TagIcon, 
  ArrowUpDown, 
  LayoutGrid, 
  List,
  X
} from 'lucide-react';
import { ItemType, SortOption } from '../types';

interface FilterBarProps {
  selectedType: ItemType | 'all';
  onSelectType: (type: ItemType | 'all') => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: { name: string; count: number }[];
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  layoutMode: 'grid' | 'list';
  onLayoutChange: (mode: 'grid' | 'list') => void;
  typeCounts: {
    all: number;
    note: number;
    link: number;
    image: number;
  };
  totalFiltered: number;
  isSearchActive: boolean;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedType,
  onSelectType,
  selectedTag,
  onSelectTag,
  allTags,
  sortOption,
  onSortChange,
  layoutMode,
  onLayoutChange,
  typeCounts,
  totalFiltered,
  isSearchActive,
  onClearFilters,
}) => {
  const hasActiveFilter = selectedType !== 'all' || selectedTag !== null || isSearchActive;

  return (
    <div className="space-y-3 mb-6">
      {/* Type Filters & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectType('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Items</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              selectedType === 'all' ? 'bg-stone-800 text-stone-200' : 'bg-stone-200/90 text-stone-600'
            }`}>
              {typeCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectType('note')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === 'note'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              selectedType === 'note' ? 'bg-amber-700 text-amber-100' : 'bg-stone-200/90 text-stone-600'
            }`}>
              {typeCounts.note}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectType('link')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === 'link'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-blue-50 hover:text-blue-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Links</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              selectedType === 'link' ? 'bg-blue-700 text-blue-100' : 'bg-stone-200/90 text-stone-600'
            }`}>
              {typeCounts.link}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectType('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === 'image'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Images</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              selectedType === 'image' ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-200/90 text-stone-600'
            }`}>
              {typeCounts.image}
            </span>
          </button>
        </div>

        {/* Right side: Sorting & Layout switch */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-stone-100 hover:bg-stone-200/70 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 py-1.5 pl-2 pr-7 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="created-desc">Newest Added</option>
              <option value="created-asc">Oldest Added</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>

          {/* Grid/List switch */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              type="button"
              onClick={() => onLayoutChange('grid')}
              className={`p-1.5 rounded ${layoutMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-700'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange('list')}
              className={`p-1.5 rounded ${layoutMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-700'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tags row (if any exist) */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          <span className="text-stone-400 font-medium flex items-center gap-1 pl-0.5 shrink-0">
            <TagIcon className="w-3 h-3" />
            <span>Tags:</span>
          </span>

          {selectedTag && (
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-900 text-white font-medium hover:bg-stone-800 shrink-0 shadow-xs"
            >
              <span>#{selectedTag}</span>
              <X className="w-3 h-3 text-stone-300" />
            </button>
          )}

          {allTags.map((tag) => {
            const isSelected = selectedTag === tag.name;
            if (isSelected) return null; // already shown above as active tag pill
            return (
              <button
                key={tag.name}
                type="button"
                onClick={() => onSelectTag(tag.name)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 font-medium transition-colors shrink-0 border border-stone-200/50"
              >
                <span>#{tag.name}</span>
                <span className="text-[10px] text-stone-400">({tag.count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter status banner if active */}
      {hasActiveFilter && (
        <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 rounded-lg px-3 py-1.5 text-xs text-amber-900">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">Showing {totalFiltered} filtered result{totalFiltered === 1 ? '' : 's'}</span>
            {selectedType !== 'all' && (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-medium">
                Type: {selectedType}
              </span>
            )}
            {selectedTag && (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-medium">
                Tag: #{selectedTag}
              </span>
            )}
            {isSearchActive && (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-medium">
                Query search active
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 shrink-0 ml-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
