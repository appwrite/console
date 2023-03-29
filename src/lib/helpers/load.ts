import { preferences } from '$lib/stores/preferences';
import { Query } from '@appwrite.io/console';
import type { Page } from '@sveltejs/kit';

export enum QueryParams {
    Page = 'page',
    Limit = 'limit',
    View = 'view',
    OrderAttribute = 'order.attribute',
    OrderDirection = 'order.direction',
    Search = 'search'
}

export function pageToOffset(page: number, limit: number): number {
    return page ? page * limit - limit : 0;
}

export function getPage(url: URL): number {
    return Number(url.searchParams.get(QueryParams.Page));
}

export function getLimit(url: URL, route: Page['route'], fallback: number): number {
    return Number(
        url.searchParams.get(QueryParams.Limit) ?? preferences.get(route).limit ?? fallback
    );
}

export enum View {
    Table = 'table',
    Grid = 'grid'
}

export function getView(url: URL, route: Page['route'], fallback: View): View {
    return (url.searchParams.get(QueryParams.View) ?? preferences.get(route).view) === View.Grid
        ? View.Grid
        : View.Table ?? fallback;
}

export function getColumns(route: Page['route'], fallback: string[]): string[] {
    return preferences.get(route).columns ?? fallback;
}

export function getSearch(url: URL): string | undefined {
    return url.searchParams.get(QueryParams.Search) ?? undefined;
}

export enum Order {
    ASC = 'asc',
    DESC = 'desc'
}

export type OrderData = {
    attribute: string;
    direction?: Order;
    query: string;
};

export function getOrder(url: URL, fallback: string): OrderData {
    const attribute = url.searchParams.get(QueryParams.OrderAttribute) ?? fallback;
    const direction = url.searchParams.get(QueryParams.OrderDirection);

    return {
        attribute,
        direction:
            direction === Order.DESC ? Order.DESC : direction === Order.ASC ? Order.ASC : undefined,
        query: direction === Order.DESC ? Query.orderDesc(attribute) : Query.orderAsc(attribute)
    };
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
