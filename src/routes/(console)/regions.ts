import { get } from 'svelte/store';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { Models } from '@appwrite.io/console';
import { regions } from '$lib/stores/organization';
import { regionMappedConsoleVariables } from '$routes/(console)/store';

let lastLoadedOrganization = null;

/**
 * Loads available regions for a given organization.
 *
 * Prevents unnecessary API calls if the regions are already loaded for the same organization.
 */
export async function loadAvailableRegions(orgId: string): Promise<void> {
    if (!isCloud || !orgId) return;

    try {
        const storedRegions = get(regions);

        if (storedRegions.regions && lastLoadedOrganization === orgId) {
            // already loaded for this organization, fast path return.
            return;
        }

        // TODO: @itznotabug, @torstendittmann we need a better way for this!
        const availableRegions = await sdk.forConsole.billing.listRegions(orgId);
        regions.set(availableRegions);

        // load all available regions at once...
        // only 2 more regions, at the time of writing this!
        await loadConsoleVariablesForRegions(availableRegions);

        lastLoadedOrganization = orgId;
    } catch (error) {
        console.error(`Failed to load regions for teamId: ${orgId}`, error);
    }
}

export function getConsoleVariableForRegion(region: string): Models.ConsoleVariables | null {
    return get(regionMappedConsoleVariables).get(region) ?? null;
}

async function loadConsoleVariablesForRegions(regions: Models.ConsoleRegionList) {
    const existing = new Set(get(regionMappedConsoleVariables).keys());

    // `fra` is the manager region, same for `default`.
    // also exclude regions that might already be loaded!
    const filteredRegions = regions.regions.filter(
        (region) =>
            region.$id !== 'fra' &&
            region.$id !== 'default' &&
            !region.disabled &&
            region.available &&
            !existing.has(region.$id)
    );

    const promises = filteredRegions.map(async (region) => {
        const vars = await sdk.forConsoleIn(region.$id).console.variables();
        return [region.$id, vars] as [string, Models.ConsoleVariables];
    });

    const results = await Promise.all(promises);

    regionMappedConsoleVariables.update((map) => {
        for (const [id, vars] of results) {
            map.set(id, vars);
        }
        return map;
    });
}
