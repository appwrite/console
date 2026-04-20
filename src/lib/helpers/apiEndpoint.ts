import {
    REGION_FRA,
    REGION_NYC,
    REGION_SFO,
    REGION_SGP,
    REGION_SYD,
    REGION_TOR,
    SUBDOMAIN_FRA,
    SUBDOMAIN_NYC,
    SUBDOMAIN_SFO,
    SUBDOMAIN_SGP,
    SUBDOMAIN_SYD,
    SUBDOMAIN_TOR
} from '$lib/constants';

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
 * `nyc.fra.cloud...` after prepending another region.
 */
export function stripLeadingRegionSubdomain(hostname: string): string {
    let host = hostname;
    let changed = true;
    while (changed) {
        changed = false;
        for (const prefix of REGION_SUBDOMAIN_PREFIXES) {
            if (host.startsWith(prefix)) {
                host = host.slice(prefix.length);
                changed = true;
                break;
            }
        }
    }
    return host;
}

/** Region prefix (e.g. `fra.`) used before the API hostname when multi-region is enabled. */
export function getRegionSubdomain(region?: string): string {
    switch (region) {
        case REGION_FRA:
            return SUBDOMAIN_FRA;
        case REGION_SYD:
            return SUBDOMAIN_SYD;
        case REGION_NYC:
            return SUBDOMAIN_NYC;
        case REGION_SFO:
            return SUBDOMAIN_SFO;
        case REGION_SGP:
            return SUBDOMAIN_SGP;
        case REGION_TOR:
            return SUBDOMAIN_TOR;
        default:
            return '';
    }
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

    const hostWithoutRegion = stripLeadingRegionSubdomain(hostname);
    return `${protocol}//${subdomain}${hostWithoutRegion}/v1`;
}
