import type { FileSystem } from '../filesystem';
import {
    IconArrowLeft,
    IconFolder,
    IconFolderOpen,
    IconJs,
    IconSvelte,
    IconCss3
} from '@appwrite.io/pink-icons-svelte';

export const icons = {
    svelte: IconSvelte,
    folder: IconFolder,
    folderOpen: IconFolderOpen,
    js: IconJs,
    highlight: IconArrowLeft,
    css: IconCss3
};

type Icon = 'svelte' | 'folder' | 'js' | 'css';

export type TreeItem = {
    path: string;
    title: string;
    icon: Icon;
    children?: TreeItem[];
};

function getIcon(filename: string): Icon {
    if (filename.endsWith('.js')) return 'js';
    if (filename.endsWith('.ts')) return 'js';
    if (filename.endsWith('.html')) return 'svelte';
    if (filename.endsWith('.css')) return 'css';
    return 'folder';
}

export function treeFromFilesystem(fs: FileSystem): TreeItem[] {
    const tree: TreeItem[] = [];

    for (const path of fs) {
        const parts = path.split('/');
        let currentLevel = tree;

        parts.forEach((part, index) => {
            const existingItem = currentLevel.find((item) => item.title === part);

            if (existingItem) {
                if (!existingItem.children) {
                    existingItem.children = [];
                }
                currentLevel = existingItem.children;
            } else {
                const isFile = index === parts.length - 1;
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
