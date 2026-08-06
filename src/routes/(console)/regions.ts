import { get } from 'svelte/store';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { isCloud, isMultiRegion } from '$lib/system';
import { regions } from '$lib/stores/organization';
import { setRegionHosts, type ConsoleRegionWithHost } from '$lib/helpers/regionHosts';
import type { Models } from '@appwrite.io/console';

let lastLoadedOrganization = null;

async function loadSelfHostedRegions(): Promise<Models.ConsoleRegionList | null> {
    try {
        const res = await fetch(`${base}/regions`, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`Failed to fetch ${base}/regions: ${res.status}`);
            return null;
        }

        const data = await res.json();
        let list: ConsoleRegionWithHost[] = [];
        if (Array.isArray(data)) {
            list = data;
        } else if (data && Array.isArray(data.regions)) {
            list = data.regions;
        } else {
            console.error('Invalid /console/regions JSON shape');
            return null;
        }

        setRegionHosts(list);
        return { total: list.length, regions: list };
    } catch (error) {
        console.error('Failed to load self-hosted regions catalog', error);
        return null;
    }
}

/**
 * Loads available regions for a given organization.
 *
 * Cloud: organizations.listRegions API.
 * Self-hosted multi-region: GET /console/regions (nginx/ConfigMap JSON).
 *
 * Prevents unnecessary API calls if the regions are already loaded for the same organization.
 */
export async function loadAvailableRegions(orgId: string, force: boolean = false): Promise<void> {
    if (!orgId) return;

    try {
        const storedRegions = get(regions);

        if (storedRegions.regions?.length && lastLoadedOrganization === orgId && !force) {
            // already loaded for this organization, fast path return.
            return;
        }

        if (isCloud) {
            const availableRegions = await sdk.forConsole.organizations.listRegions({
                organizationId: orgId
            });
            regions.set(availableRegions);
            lastLoadedOrganization = orgId;
            return;
        }

        if (isMultiRegion) {
            const catalog = await loadSelfHostedRegions();
            if (catalog) {
                regions.set(catalog);
                lastLoadedOrganization = orgId;
            }
        }
    } catch (error) {
        console.error(`Failed to load regions for teamId: ${orgId}`, error);
    }
}
