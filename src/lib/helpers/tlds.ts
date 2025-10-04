import { parse } from 'tldts';

/**
 * Returns the apex/root domain from a full domain string.
 */
export function getApexDomain(domain: string): string | null {
    return parse(domain, { allowPrivateDomains: true }).domain;
}

/**
 * Checks whether the given domain is a subdomain.
 */
export function isASubdomain(domain: string | null): boolean {
    if (!domain) return false;

    const { domain: apex, subdomain } = parse(domain, { allowPrivateDomains: true });
    if (!apex) return false;

    return !!subdomain;
}

/**
 * Returns the subdomain part from a full domain string.
 */
export function getSubdomain(domain: string): string {
    if (!domain) return '';

    return parse(domain, { allowPrivateDomains: true }).subdomain || '';
}
