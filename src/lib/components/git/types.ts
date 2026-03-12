import type { Icon } from '@appwrite.io/pink-svelte';

export type DirectoryEntry = {
    title: string;
    fullPath: string;
    fileCount?: number;
    thumbnailUrl?: string;
    thumbnailIcon?: typeof Icon;
    thumbnailHtml?: string;
    children?: DirectoryEntry[];
    hasChildren?: boolean;
    showThumbnail?: boolean;
    loading?: boolean;
};
