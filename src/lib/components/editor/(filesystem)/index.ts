import type { ComponentType } from 'svelte';
import {
    IconArrowLeft,
    IconFolder,
    IconFolderOpen,
    IconJs,
    IconSvelte,
    IconCss3,
    IconDocument,
    IconHtml5
} from '@appwrite.io/pink-icons-svelte';

export const icons: Record<Icon, ComponentType> = {
    svelte: IconSvelte,
    file: IconDocument,
    folder: IconFolder,
    html: IconHtml5,
    folderOpen: IconFolderOpen,
    js: IconJs,
    highlight: IconArrowLeft,
    css: IconCss3
};

type Icon = 'svelte' | 'folder' | 'folderOpen' | 'html' | 'js' | 'css' | 'file' | 'highlight';

export type TreeItem = {
    path: string;
    title: string;
    icon: Icon;
    children?: TreeItem[];
};

function getIcon(filename: string): Icon {
    if (filename.endsWith('.js')) return 'js';
    if (filename.endsWith('.ts')) return 'js';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.svelte')) return 'svelte';

    return 'file';
}

export function treeFromFilesystem(files: string[]): TreeItem[] {
    const tree: TreeItem[] = [];

    for (const path of files) {
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;

        if (!normalizedPath) continue;

        const parts = normalizedPath.split('/');
        let currentLevel = tree;

        parts.forEach((part, index) => {
            if (!part) return;

            const existingItem = currentLevel.find((item) => item.title === part);

            if (existingItem) {
                if (!existingItem.children) {
                    existingItem.children = [];
                }
                currentLevel = existingItem.children;
            } else {
                const isFile = index === parts.length - 1 && !path.endsWith('/');
                const currentPath = parts.slice(0, index + 1).join('/');
                const newItem: TreeItem = {
                    title: part,
                    icon: isFile ? getIcon(part) : 'folder',
                    children: isFile ? undefined : [],
                    path: currentPath
                };

                currentLevel.unshift(newItem);

                if (!isFile) {
                    currentLevel = newItem.children!;
                }
            }
        });
    }

    return tree;
}
