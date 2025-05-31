import { parse } from 'tldts';

/**
 * Returns the apex/root domain from a full domain string.
 */
export function getApexDomain(domain: string): string | null {
    return parse(domain).domain;
}

/**
 * Checks whether the given domain is a subdomain.
 */
export function isASubdomain(domain: string | null): boolean {
    if (!domain) return false;

    const { domain: apex, subdomain } = parse(domain);
    if (!apex) return false;
    if (subdomain === 'www') return false;

    return !!subdomain;
}
