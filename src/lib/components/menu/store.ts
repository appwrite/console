import { writable } from 'svelte/store';
import type { createMenubar } from '@melt-ui/svelte';

export const menuOpen = writable(false);

export const activeMenuId = writable<string | null>(null);

/**
 * Full menu context passed to submenus —
 * includes `builders` and shared `separator`.
 */
export type MenuContext = {
    separator: ReturnType<
        ReturnType<typeof createMenubar>['builders']['createMenu']
    >['elements']['separator'];
    builders: ReturnType<ReturnType<typeof createMenubar>['builders']['createMenu']>['builders'];
};
