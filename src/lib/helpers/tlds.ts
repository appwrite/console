import { parse } from 'tldts';

/**
 * Returns the apex/root domain from a full domain string.
 */
export function getApexDomain(domain: string): string {
    return parse(domain).domain;
}
