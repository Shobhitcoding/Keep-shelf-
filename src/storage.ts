import { InboxItem } from './types';

const STORAGE_KEY = 'local_inbox_items_v2';
const INITIALIZED_KEY = 'local_inbox_has_initialized_v2';

export const SAMPLE_ITEMS: InboxItem[] = [
  {
    id: 'sample-1',
    type: 'note',
    title: 'Welcome to KeepShelf! 🚀',
    content: `Here's how to get the most out of KeepShelf:

• Everything is saved directly in your browser's local storage — no account, cloud sync, or server required.
• Save quick notes, bookmark web links, and upload or paste images.
• Add custom tags to categorize your items.
• Use the search bar or tag filters to instantly find what you need.
• Archive items you're finished with to keep your inbox clean, or restore them anytime.
• Use the Backup tool in the top right to export or import your data as JSON.`,
    tags: ['guide', 'getting-started', 'tips'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isArchived: false,
    isPinned: true,
  },
  {
    id: 'sample-2',
    type: 'link',
    title: 'MDN Web Docs - Web Technologies Guide',
    content: 'Comprehensive documentation for web standards including HTML, CSS, JavaScript, and Web APIs.',
    url: 'https://developer.mozilla.org',
    tags: ['dev', 'reference', 'learning'],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    isArchived: false,
    isPinned: false,
  },
  {
    id: 'sample-3',
    type: 'image',
    title: 'Clean Minimal Workspace Inspiration',
    content: 'Warm desk setup idea with wooden textures, notebook, and ambient lighting.',
    url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=80',
    tags: ['inspiration', 'workspace', 'design'],
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    isArchived: false,
    isPinned: false,
  },
  {
    id: 'sample-4',
    type: 'note',
    title: 'Archive Example: Grocery checklist',
    content: 'Almond milk, Sourdough bread, Avocados, Greek yogurt, Fresh berries, Dark roast coffee beans.',
    tags: ['personal', 'shopping'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    isArchived: true,
    isPinned: false,
  }
];

export function getStoredItems(): InboxItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const hasInitialized = localStorage.getItem(INITIALIZED_KEY);

    if (!raw && !hasInitialized) {
      // First time initialization with demo data
      saveStoredItems(SAMPLE_ITEMS);
      localStorage.setItem(INITIALIZED_KEY, 'true');
      return SAMPLE_ITEMS;
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to load items from localStorage:', error);
    return [];
  }
}

export function saveStoredItems(items: InboxItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(INITIALIZED_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Failed to save items to localStorage (quota or access error):', error);
    return false;
  }
}

export function generateId(): string {
  return 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Resizes an image file to max dimensions and compresses it to avoid localStorage quota limits
 */
export async function compressImageFile(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to webp or jpeg
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to parse image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Normalize and validate URLs
 */
export function normalizeUrl(inputUrl: string): string {
  let trimmed = inputUrl.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
