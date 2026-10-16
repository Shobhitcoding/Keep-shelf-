export type ItemType = 'note' | 'link' | 'image';

export interface InboxItem {
  id: string;
  type: ItemType;
  title: string;
  content?: string;
  url?: string;
  imageData?: string; // base64 data url for uploaded local images
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isArchived: boolean;
  isPinned?: boolean;
}

export type SortOption = 'updated-desc' | 'created-desc' | 'created-asc' | 'title-asc';
export type ViewMode = 'inbox' | 'archived';
