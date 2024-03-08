import { preferences } from '$lib/stores/preferences';
import type { Page } from '@sveltejs/kit';

export function pageToOffset(page: number, limit: number): number {
    return page ? page * limit - limit : 0;
}

export function getPage(url: URL): number {
    return Number(url.searchParams.get('page'));
}

export function getLimit(url: URL, route: Page['route'], fallback: number): number {
    return Number(url.searchParams.get('limit') ?? preferences.get(route).limit ?? fallback);
}

export enum View {
    Table = 'table',
    Grid = 'grid'
}

export function getView(url: URL, route: Page['route'], fallback: View): View {
    return (url.searchParams.get('view') ?? preferences.get(route).view) === View.Grid
        ? View.Grid
        : View.Table ?? fallback;
}

export function getColumns(route: Page['route'], fallback: string[]): string[] {
    return preferences.get(route).columns ?? fallback;
}

export function getSearch(url: URL): string | undefined {
    return url.searchParams.get('search') ?? undefined;
}

export function getQuery(url: URL): string | undefined {
    return url.searchParams.get('query') ?? undefined;
}

type TabElement = { href: string; title: string; hasChildren?: boolean };

export function isTabSelected(
    tab: TabElement,
    pathname: string,
    basePath: string,
    tabs: TabElement[]
) {
    if (!tab?.hasChildren) {
        return tab.href === pathname;
    } else {
        if (tab.href === pathname) return true;

        if (tab.href === basePath) {
            if (!tabs.some((t) => pathname.includes(t.href) && t.href !== tab.href)) {
                return pathname.includes(tab.href);
            }
        } else {
            return pathname.includes(tab.href);
        }
    }
}
