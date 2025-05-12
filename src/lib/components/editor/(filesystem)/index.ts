import type { ComponentType } from 'svelte';
import {
    IconArrowLeft,
    IconFolder,
    IconFolderOpen,
    IconJs,
    IconSvelte,
    IconCss3,
    IconDocument,
    IconHtml5,
    IconVariable,
    IconDocumentText
} from '@appwrite.io/pink-icons-svelte';

export const icons: Record<Icon, ComponentType> = {
    svelte: IconSvelte,
    file: IconDocument,
    folder: IconFolder,
    html: IconHtml5,
    folderOpen: IconFolderOpen,
    js: IconJs,
    highlight: IconArrowLeft,
    css: IconCss3,
    config: IconVariable,
    document: IconDocumentText
};

type Icon =
    | 'svelte'
    | 'folder'
    | 'folderOpen'
    | 'html'
    | 'js'
    | 'css'
    | 'file'
    | 'config'
    | 'document'
    | 'highlight';

export type TreeItem = {
    path: string;
    title: string;
    icon: Icon;
    children?: TreeItem[];
};

function getIcon(filename: string): Icon {
    switch (true) {
        case filename.endsWith('.js'):
            return 'js';
        case filename.endsWith('.ts'):
            return 'js';
        case filename.endsWith('.html'):
            return 'html';
        case filename.endsWith('.css'):
            return 'css';
        case filename.endsWith('.svelte'):
            return 'svelte';
        case filename.endsWith('.md'):
            return 'document';
        case filename.endsWith('.json'):
        case filename.endsWith('.jsonc'):
        case filename.endsWith('.yml'):
        case filename.endsWith('.yaml'):
            return 'config';
    }
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
                if (existingItem.children) {
                    currentLevel = existingItem.children;
                }
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

    const sort = (value: TreeItem[]) => {
        value.sort((a, b) => {
            const aIsFolder = a.children !== undefined;
            const bIsFolder = b.children !== undefined;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a.title.localeCompare(b.title);
        });

        value.forEach((item) => {
            if (item.children) {
                sort(item.children);
            }
        });
    };

    sort(tree);

    return tree;
}
