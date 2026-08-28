import {
    SUBDOMAIN_FRA,
    SUBDOMAIN_NYC,
    SUBDOMAIN_SFO,
    SUBDOMAIN_SGP,
    SUBDOMAIN_SYD,
    SUBDOMAIN_TOR
} from '$lib/constants';

/**
 * The placeholder region used for region-less projects. It maps to the apex
 * domain (no subdomain) and must never be turned into a subdomain.
 */
const DEFAULT_REGION = 'default';

/** Ordered list of region DNS prefixes (e.g. `fra.`) for stripping from API hostnames. */
const REGION_SUBDOMAIN_PREFIXES: readonly string[] = [
    SUBDOMAIN_FRA,
    SUBDOMAIN_NYC,
    SUBDOMAIN_SYD,
    SUBDOMAIN_SFO,
    SUBDOMAIN_SGP,
    SUBDOMAIN_TOR
];

/**
 * Removes leading Appwrite Cloud region label(s) from `hostname` (e.g. `fra.`).
 * Strips repeatedly so a doubled prefix (`fra.fra.cloud...`) does not become
 * `nyc.fra.cloud...` after prepending another region. An optional `extraPrefix`
 * (the region about to be prepended) is stripped too, so regions outside the
 * well-known set do not get doubled up.
 */
export function stripLeadingRegionSubdomain(hostname: string, extraPrefix?: string): string {
    const prefixes =
        extraPrefix && !REGION_SUBDOMAIN_PREFIXES.includes(extraPrefix)
            ? [extraPrefix, ...REGION_SUBDOMAIN_PREFIXES]
            : REGION_SUBDOMAIN_PREFIXES;

    let host = hostname;
    let changed = true;
    while (changed) {
        changed = false;
        for (const prefix of prefixes) {
            if (host.startsWith(prefix)) {
                host = host.slice(prefix.length);
                changed = true;
                break;
            }
        }
    }
    return host;
}

/**
 * Region prefix (e.g. `fra.`) used before the API hostname when multi-region is
 * enabled. The set of Appwrite Cloud regions is dynamic and grows over time, so
 * the prefix is derived directly from the region id rather than a hardcoded
 * list — otherwise projects in a newly added region resolve to no subdomain,
 * hit the apex domain, and fail with CORS errors. The `default` placeholder
 * (and empty/undefined values) resolve to the apex domain.
 */
export function getRegionSubdomain(region?: string): string {
    if (!region || region === DEFAULT_REGION) return '';
    return `${region}.`;
}

/**
 * Builds the `/v1` API base URL (protocol + host + `/v1`).
 * When `isMultiRegion` is true and a region is selected, strips any known region prefix from the host,
 * then prepends that region. If multi-region is on but no region is requested (`region` missing or
 * unknown), the hostname is left unchanged so a default region baked into `APPWRITE_ENDPOINT` is kept.
 */
export function buildRegionalV1Endpoint(
    protocol: string,
    hostname: string,
    region: string | undefined,
    isMultiRegion: boolean
): string {
    if (!isMultiRegion) {
        return `${protocol}//${hostname}/v1`;
    }

    const subdomain = getRegionSubdomain(region);
    if (!subdomain) {
        return `${protocol}//${hostname}/v1`;
    }

    const hostWithoutRegion = stripLeadingRegionSubdomain(hostname, subdomain);
    return `${protocol}//${subdomain}${hostWithoutRegion}/v1`;
}
