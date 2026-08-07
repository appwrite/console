import { get } from 'svelte/store';
import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import { sdk } from '$lib/stores/sdk';
import { isCloud, isMultiRegion } from '$lib/system';
import { regions } from '$lib/stores/organization';
import { setRegionHosts, type ConsoleRegionWithHost } from '$lib/helpers/regionHosts';
import type { Models } from '@appwrite.io/console';

let lastLoadedOrganization = null;
let selfHostedRegionsPromise: Promise<Models.ConsoleRegionList> | null = null;

async function loadSelfHostedRegions(): Promise<Models.ConsoleRegionList> {
    try {
        const res = await fetch(`${base}/regions`, { cache: 'no-store' });
        if (!res.ok) {
            throw error(503, `Failed to fetch ${base}/regions: ${res.status}`);
        }

        const data = await res.json();
        let list: ConsoleRegionWithHost[] = [];
        if (Array.isArray(data)) {
            list = data;
        } else if (data && Array.isArray(data.regions)) {
            list = data.regions;
        } else {
            throw error(503, 'Invalid /console/regions JSON shape');
        }

        if (!list.length) {
            throw error(503, 'Self-hosted regions catalog is empty');
        }

        setRegionHosts(list);
        return { total: list.length, regions: list };
    } catch (err) {
        // Preserve SvelteKit HttpError from this loader; wrap other failures.
        if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
            throw err;
        }
        console.error('Failed to load self-hosted regions catalog', err);
        throw error(503, 'Failed to load self-hosted regions catalog');
    }
}

/**
 * Ensure self-hosted `/console/regions` hosts are loaded before the first regional SDK call.
 * No-op on Cloud or when multi-region is disabled. Idempotent (shared in-flight promise).
 * Hard-fails on catalog load errors so regional traffic cannot silently fall back to apex `/v1`.
 */
export async function ensureSelfHostedRegions(): Promise<void> {
    if (isCloud || !isMultiRegion) return;

    const stored = get(regions);
    if (stored.regions?.length) {
        setRegionHosts(stored.regions as ConsoleRegionWithHost[]);
        return;
    }

    if (!selfHostedRegionsPromise) {
        selfHostedRegionsPromise = loadSelfHostedRegions().finally(() => {
            // Allow retry after a failed fetch on the next navigation.
            if (!get(regions).regions?.length) {
                selfHostedRegionsPromise = null;
            }
        });
    }

    regions.set(await selfHostedRegionsPromise);
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
            if (force) {
                selfHostedRegionsPromise = null;
            }
            await ensureSelfHostedRegions();
            lastLoadedOrganization = orgId;
        }
    } catch (err) {
        console.error(`Failed to load regions for teamId: ${orgId}`, err);
        // Multi-region SH must not continue with an empty host map (apex fallback).
        if (isMultiRegion && !isCloud) {
            throw err;
        }
    }
}
