import { describe, expect, it } from 'vitest';
import {
    buildRegionalV1Endpoint,
    getRegionSubdomain,
    stripLeadingRegionSubdomain
} from '$lib/helpers/apiEndpoint';

describe('getRegionSubdomain', () => {
    it('maps the well-known regions to their subdomains', () => {
        expect(getRegionSubdomain('fra')).toBe('fra.');
        expect(getRegionSubdomain('syd')).toBe('syd.');
        expect(getRegionSubdomain('nyc')).toBe('nyc.');
        expect(getRegionSubdomain('sfo')).toBe('sfo.');
        expect(getRegionSubdomain('sgp')).toBe('sgp.');
        expect(getRegionSubdomain('tor')).toBe('tor.');
    });

    it('derives a subdomain for regions that are not hardcoded', () => {
        // A project living in a newer Appwrite Cloud region (e.g. Bangalore)
        // must still be routed to its own regional subdomain. Previously these
        // fell through to the empty default, so the SDK hit the apex domain and
        // navigation got stuck with CORS errors.
        expect(getRegionSubdomain('blr')).toBe('blr.');
        expect(getRegionSubdomain('lon')).toBe('lon.');
    });

    it('resolves the default placeholder and empty values to the apex domain', () => {
        expect(getRegionSubdomain('default')).toBe('');
        expect(getRegionSubdomain('')).toBe('');
        expect(getRegionSubdomain(undefined)).toBe('');
    });
});

describe('buildRegionalV1Endpoint', () => {
    it('leaves the host untouched when multi-region is disabled', () => {
        expect(buildRegionalV1Endpoint('https:', 'cloud.appwrite.io', 'blr', false)).toBe(
            'https://cloud.appwrite.io/v1'
        );
    });

    it('leaves the host untouched for the default/unknown placeholder region', () => {
        expect(buildRegionalV1Endpoint('https:', 'fra.cloud.appwrite.io', 'default', true)).toBe(
            'https://fra.cloud.appwrite.io/v1'
        );
    });

    it('prepends the regional subdomain for a hardcoded region', () => {
        expect(buildRegionalV1Endpoint('https:', 'fra.cloud.appwrite.io', 'nyc', true)).toBe(
            'https://nyc.cloud.appwrite.io/v1'
        );
    });

    it('prepends the regional subdomain for a region outside the hardcoded set', () => {
        // apex host
        expect(buildRegionalV1Endpoint('https:', 'cloud.appwrite.io', 'blr', true)).toBe(
            'https://blr.cloud.appwrite.io/v1'
        );
        // host that already carries a known region label
        expect(buildRegionalV1Endpoint('https:', 'fra.cloud.appwrite.io', 'blr', true)).toBe(
            'https://blr.cloud.appwrite.io/v1'
        );
    });

    it('does not double the subdomain when the host already carries the target region', () => {
        expect(buildRegionalV1Endpoint('https:', 'blr.cloud.appwrite.io', 'blr', true)).toBe(
            'https://blr.cloud.appwrite.io/v1'
        );
    });
});

describe('stripLeadingRegionSubdomain', () => {
    it('strips a known leading region label', () => {
        expect(stripLeadingRegionSubdomain('fra.cloud.appwrite.io')).toBe('cloud.appwrite.io');
    });

    it('collapses doubled region labels', () => {
        expect(stripLeadingRegionSubdomain('fra.fra.cloud.appwrite.io')).toBe('cloud.appwrite.io');
    });

    it('leaves a bare apex host untouched', () => {
        expect(stripLeadingRegionSubdomain('cloud.appwrite.io')).toBe('cloud.appwrite.io');
    });
});
