import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Database,
  HardDrive
} from 'lucide-react';
import { InboxItem } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InboxItem[];
  onImportItems: (newItems: InboxItem[], mode: 'merge' | 'replace') => void;
  onResetSampleData: () => void;
  onClearAll: () => void;
  onToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  items,
  onImportItems,
  onResetSampleData,
  onClearAll,
  onToast,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Calculate approximate storage used
  const rawJson = JSON.stringify(items);
  const bytesUsed = new Blob([rawJson]).size;
  const kbUsed = (bytesUsed / 1024).toFixed(1);

  // Export JSON file
  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `keepshelf-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast(`Exported ${items.length} items to JSON backup file!`, 'success');
    } catch (err) {
      console.error(err);
      onToast('Failed to export backup file', 'warning');
    }
  };

  // Import JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          throw new Error('File does not contain an array of items');
        }

        // Validate basic item shape
        const validItems: InboxItem[] = [];
        for (const it of parsed) {
          if (it && typeof it === 'object' && it.id && it.title && it.type) {
            validItems.push({
              id: String(it.id),
              type: it.type === 'link' || it.type === 'image' ? it.type : 'note',
              title: String(it.title),
              content: it.content ? String(it.content) : undefined,
              url: it.url ? String(it.url) : undefined,
              imageData: it.imageData ? String(it.imageData) : undefined,
              tags: Array.isArray(it.tags) ? it.tags.map(String) : [],
              createdAt: it.createdAt ? String(it.createdAt) : new Date().toISOString(),
              updatedAt: it.updatedAt ? String(it.updatedAt) : new Date().toISOString(),
              isArchived: Boolean(it.isArchived),
              isPinned: Boolean(it.isPinned),
            });
          }
        }

        if (validItems.length === 0) {
          onToast('No valid inbox items found in JSON file', 'warning');
          return;
        }

        // Prompt merge or replace
        const shouldReplace = window.confirm(
          `Found ${validItems.length} valid item(s).\n\nClick 'OK' to MERGE with current items, or 'Cancel' to REPLACE your entire inbox.`
        );

        onImportItems(validItems, shouldReplace ? 'merge' : 'replace');
        onToast(`Imported ${validItems.length} items successfully!`, 'success');
        onClose();
      } catch (err) {
        console.error(err);
        onToast('Invalid JSON file format. Could not import.', 'warning');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center text-stone-700">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-lg">
                Local Data & Backup
              </h2>
              <p className="text-xs text-stone-500">
                Manage your device storage & backup files
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status info */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-600">
              <HardDrive className="w-4 h-4 text-stone-400" />
              <span>Items Stored: <strong className="text-stone-900 font-semibold">{items.length}</strong></span>
            </div>
            <span className="text-stone-500 font-mono">
              ~{kbUsed} KB used in browser
            </span>
          </div>

          {/* Backup / Restore section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Export & Import
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>Export as JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Import JSON Backup</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Reset & Wipe section */}
          <div className="pt-3 border-t border-stone-200 space-y-3">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Management & Reset
            </h3>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset inbox back to the initial sample items? Current items will be replaced.')) {
                    onResetSampleData();
                    onToast('Reset to starter sample items', 'info');
                    onClose();
                  }
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-stone-400" />
                  <span>Restore Starter Examples</span>
                </div>
                <span className="text-[11px] text-stone-400">Default demo items</span>
              </button>

              {confirmClear ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Are you sure? This will delete all {items.length} items permanently.</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-200/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClearAll();
                        setConfirmClear(false);
                        onToast('All KeepShelf data has been cleared', 'info');
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
                    >
                      Yes, Clear All
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center justify-between p-3 rounded-xl border border-red-100 hover:bg-red-50 text-red-700 text-xs font-medium transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Clear All Saved Items</span>
                  </div>
                  <span className="text-[11px] text-red-400">Wipe local storage</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
