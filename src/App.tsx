/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  InboxItem, 
  ItemType, 
  SortOption, 
  ViewMode 
} from './types';
import { 
  getStoredItems, 
  saveStoredItems, 
  generateId, 
  SAMPLE_ITEMS 
} from './storage';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ItemEditorModal } from './components/ItemEditorModal';
import { BackupModal } from './components/BackupModal';
import { EmptyState } from './components/EmptyState';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Sparkles, ShieldCheck, HardDrive } from 'lucide-react';

export default function App() {
  // State
  const [items, setItems] = useState<InboxItem[]>(() => getStoredItems());
  const [viewMode, setViewMode] = useState<ViewMode>('inbox');
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InboxItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<InboxItem | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const addToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync to local storage whenever items state changes
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      if (e.key === '/' && !isEditorOpen && !selectedDetailItem && !isBackupOpen) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      } else if ((e.key === 'n' || e.key === 'N') && !isEditorOpen && !selectedDetailItem && !isBackupOpen) {
        e.preventDefault();
        setEditingItem(null);
        setIsEditorOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen, selectedDetailItem, isBackupOpen]);

  // Derived counts
  const inboxCount = useMemo(() => items.filter((i) => !i.isArchived).length, [items]);
  const archivedCount = useMemo(() => items.filter((i) => i.isArchived).length, [items]);

  // All unique tags with counts for current view mode
  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    items
      .filter((i) => (viewMode === 'inbox' ? !i.isArchived : i.isArchived))
      .forEach((item) => {
        item.tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [items, viewMode]);

  // Unique tags across all items for suggestions in editor
  const suggestedTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      // View mode filter
      if (viewMode === 'inbox' && item.isArchived) return false;
      if (viewMode === 'archived' && !item.isArchived) return false;

      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) return false;

      // Tag filter
      if (selectedTag && !item.tags.includes(selectedTag)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchContent = item.content?.toLowerCase().includes(q) ?? false;
        const matchUrl = item.url?.toLowerCase().includes(q) ?? false;
        const matchTag = item.tags.some((t) => t.toLowerCase().includes(q.replace(/^#/, '')));

        if (!matchTitle && !matchContent && !matchUrl && !matchTag) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      // Pinned items first when viewing inbox
      if (viewMode === 'inbox') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      switch (sortOption) {
        case 'updated-desc':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [items, viewMode, selectedType, selectedTag, searchQuery, sortOption]);

  // Type counts for current view mode
  const currentViewItems = useMemo(() => {
    return items.filter((i) => (viewMode === 'inbox' ? !i.isArchived : i.isArchived));
  }, [items, viewMode]);

  const typeCounts = useMemo(() => {
    return {
      all: currentViewItems.length,
      note: currentViewItems.filter((i) => i.type === 'note').length,
      link: currentViewItems.filter((i) => i.type === 'link').length,
      image: currentViewItems.filter((i) => i.type === 'image').length,
    };
  }, [currentViewItems]);

  // Actions
  const handleSaveItem = (itemData: {
    id?: string;
    type: ItemType;
    title: string;
    content?: string;
    url?: string;
    imageData?: string;
    tags: string[];
    isArchived: boolean;
    isPinned: boolean;
  }) => {
    const now = new Date().toISOString();

    if (itemData.id) {
      // Update existing item
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === itemData.id) {
            const updated: InboxItem = {
              ...it,
              type: itemData.type,
              title: itemData.title,
              content: itemData.content,
              url: itemData.url,
              imageData: itemData.imageData,
              tags: itemData.tags,
              isArchived: itemData.isArchived,
              isPinned: itemData.isPinned,
              updatedAt: now,
            };
            if (selectedDetailItem?.id === updated.id) {
              setSelectedDetailItem(updated);
            }
            return updated;
          }
          return it;
        })
      );
      addToast(`Updated "${itemData.title}"`);
    } else {
      // Create new item
      const newItem: InboxItem = {
        id: generateId(),
        type: itemData.type,
        title: itemData.title,
        content: itemData.content,
        url: itemData.url,
        imageData: itemData.imageData,
        tags: itemData.tags,
        isArchived: itemData.isArchived,
        isPinned: itemData.isPinned,
        createdAt: now,
        updatedAt: now,
      };

      setItems((prev) => [newItem, ...prev]);
      addToast(`Saved new ${newItem.type}: "${newItem.title}"`);
    }
  };

  const handleToggleArchive = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updatedState = !it.isArchived;
          addToast(
            updatedState ? `Moved "${it.title}" to Archive` : `Restored "${it.title}" to Inbox`,
            'info'
          );
          const updated = {
            ...it,
            isArchived: updatedState,
            updatedAt: new Date().toISOString(),
          };
          if (selectedDetailItem?.id === id) {
            setSelectedDetailItem(updated);
          }
          return updated;
        }
        return it;
      })
    );
  };

  const handleTogglePin = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const newPinned = !it.isPinned;
          addToast(newPinned ? `Pinned to top: "${it.title}"` : `Unpinned: "${it.title}"`, 'info');
          const updated = {
            ...it,
            isPinned: newPinned,
            updatedAt: new Date().toISOString(),
          };
          if (selectedDetailItem?.id === id) {
            setSelectedDetailItem(updated);
          }
          return updated;
        }
        return it;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedDetailItem?.id === id) {
      setSelectedDetailItem(null);
    }
    addToast(`Deleted "${itemToDelete?.title || 'item'}"`, 'info');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        addToast(`Copied ${label} to clipboard!`, 'success');
      })
      .catch(() => {
        addToast(`Failed to copy to clipboard`, 'warning');
      });
  };

  const handleImportItems = (newItems: InboxItem[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setItems(newItems);
    } else {
      // Merge by ID avoiding duplicates
      setItems((prev) => {
        const existingMap = new Map(prev.map((i) => [i.id, i]));
        newItems.forEach((i) => existingMap.set(i.id, i));
        return Array.from(existingMap.values());
      });
    }
  };

  const handleResetSampleData = () => {
    setItems(SAMPLE_ITEMS);
  };

  const handleClearAll = () => {
    setItems([]);
    setSelectedDetailItem(null);
  };

  const handleClearFilters = () => {
    setSelectedType('all');
    setSelectedTag(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        inboxCount={inboxCount}
        archivedCount={archivedCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => {
          setEditingItem(null);
          setIsEditorOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter & Sort Bar */}
        <FilterBar
          selectedType={selectedType}
          onSelectType={setSelectedType}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          allTags={allTags}
          sortOption={sortOption}
          onSortChange={setSortOption}
          layoutMode={layoutMode}
          onLayoutChange={setLayoutMode}
          typeCounts={typeCounts}
          totalFiltered={filteredItems.length}
          isSearchActive={Boolean(searchQuery.trim())}
          onClearFilters={handleClearFilters}
        />

        {/* Items Grid or Empty State */}
        {filteredItems.length === 0 ? (
          <EmptyState
            viewMode={viewMode}
            selectedType={selectedType}
            selectedTag={selectedTag}
            searchQuery={searchQuery}
            onClearFilters={handleClearFilters}
            onCreateNew={() => {
              setEditingItem(null);
              setIsEditorOpen(true);
            }}
          />
        ) : (
          <div
            className={
              layoutMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                : 'space-y-3'
            }
          >
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                layoutMode={layoutMode}
                onSelect={(it) => setSelectedDetailItem(it)}
                onEdit={(it) => {
                  setEditingItem(it);
                  setIsEditorOpen(true);
                }}
                onToggleArchive={handleToggleArchive}
                onTogglePin={handleTogglePin}
                onDelete={handleDeleteItem}
                onTagClick={(tag) => setSelectedTag(tag)}
                onCopyText={handleCopyText}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white/70 py-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Single-Device Local Storage</span>
            <span className="text-stone-300">•</span>
            <span>No authentication or server required</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <span>Press <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded font-mono text-[11px] text-stone-600">/</kbd> to search</span>
            <span>Press <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded font-mono text-[11px] text-stone-600">N</kbd> for new item</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ItemEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        existingItem={editingItem}
        suggestedTags={suggestedTags}
      />

      <ItemDetailModal
        item={selectedDetailItem}
        isOpen={selectedDetailItem !== null}
        onClose={() => setSelectedDetailItem(null)}
        onEdit={(it) => {
          setSelectedDetailItem(null);
          setEditingItem(it);
          setIsEditorOpen(true);
        }}
        onToggleArchive={handleToggleArchive}
        onTogglePin={handleTogglePin}
        onDelete={handleDeleteItem}
        onTagClick={(tag) => {
          setSelectedTag(tag);
        }}
        onCopyText={handleCopyText}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        items={items}
        onImportItems={handleImportItems}
        onResetSampleData={handleResetSampleData}
        onClearAll={handleClearAll}
        onToast={addToast}
      />

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
