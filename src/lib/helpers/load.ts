export function pageToOffset(page: number, limit: number): number {
    return page ? page * limit - limit : 0;
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
