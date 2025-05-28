import { get } from 'svelte/store';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { regions } from '$lib/stores/organization';

let lastLoadedOrganization = null;

/**
 * Loads available regions for a given organization.
 *
 * Prevents unnecessary API calls if the regions are already loaded for the same organization.
 */
export async function loadAvailableRegions(orgId: string): Promise<void> {
    if (!isCloud) return;

    try {
        const storedRegions = get(regions);

        if (storedRegions.regions && lastLoadedOrganization === orgId) {
            // already loaded for this organization, fast path return.
            return;
        }

        // TODO: @itznotabug, @torstendittmann we need a better way for this!
        const availableRegions = await sdk.forConsole.billing.listRegions(orgId);
        regions.set(availableRegions);

        lastLoadedOrganization = orgId;
    } catch (error) {
        console.error(`Failed to load regions for teamId: ${orgId}`, error);
    }
}
