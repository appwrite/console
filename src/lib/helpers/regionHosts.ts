import type { Models } from '@appwrite.io/console';

export type RegionHostInfo = {
    hostname?: string;
    endpoint?: string;
};

export type ConsoleRegionWithHost = Models.ConsoleRegion & {
    hostname?: string;
    endpoint?: string;
};

const byId = new Map<string, RegionHostInfo>();

/** Populate hostname/endpoint overrides from the regions catalog. */
export function setRegionHosts(list: ConsoleRegionWithHost[] | null | undefined): void {
    byId.clear();
    if (!list?.length) return;

    for (const region of list) {
        const id = region?.$id;
        if (!id) continue;

        const { hostname, endpoint } = region;
        if (hostname || endpoint) {
            byId.set(id, { hostname, endpoint });
        }
    }
}

/**
 * Resolve an explicit regional API base URL from the catalog.
 * Returns null when the region has no hostname/endpoint override (Cloud subdomain logic applies).
 */
export function resolveRegionV1Endpoint(
    protocol: string,
    region: string | undefined
): string | null {
    if (!region || region === 'default') return null;

    const info = byId.get(region);
    if (!info) return null;

    if (info.endpoint) {
        const trimmed = info.endpoint.replace(/\/$/, '');
        return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
    }

    if (info.hostname) {
        return `${protocol}//${info.hostname}/v1`;
    }

    return null;
}
