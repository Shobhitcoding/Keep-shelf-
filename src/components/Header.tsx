import React from 'react';
import { 
  Inbox, 
  Archive, 
  Plus, 
  Search, 
  X, 
  Database,
  Sparkles
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  inboxCount: number;
  archivedCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateModal: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  inboxCount,
  archivedCount,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenBackupModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Brand & Mode switch */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-600/20">
                <Inbox className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-stone-900 text-lg tracking-tight leading-none">
                  KeepShelf
                </h1>
                <p className="text-[11px] text-stone-500 font-medium mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Single-Device Storage
                </p>
              </div>
            </div>

            {/* View Mode Switch Tabs */}
            <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200/80 ml-1 sm:ml-4">
              <button
                type="button"
                onClick={() => onViewModeChange('inbox')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  viewMode === 'inbox'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Inbox className="w-4 h-4 text-amber-600" />
                <span>Inbox</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                  viewMode === 'inbox' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'
                }`}>
                  {inboxCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('archived')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  viewMode === 'archived'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Archive className="w-4 h-4 text-stone-500" />
                <span>Archive</span>
                {archivedCount > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    viewMode === 'archived' ? 'bg-stone-200 text-stone-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {archivedCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search titles, notes, URLs, or #tags (Press / to focus)"
                className="w-full pl-9 pr-9 py-2 text-sm bg-stone-100/80 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenBackupModal}
              title="Backup & Manage local data"
              className="p-2 sm:px-3 sm:py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-transparent hover:border-stone-200 transition-all flex items-center gap-1.5 text-xs sm:text-sm font-medium"
            >
              <Database className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Data & Backup</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Item</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items, notes, links or #tags..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
