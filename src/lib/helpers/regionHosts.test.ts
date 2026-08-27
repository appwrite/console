import { expect, test, beforeEach } from 'vitest';
import {
    setRegionHosts,
    resolveRegionV1Endpoint,
    type ConsoleRegionWithHost
} from '$lib/helpers/regionHosts';

function region(partial: Partial<ConsoleRegionWithHost> & { $id: string }): ConsoleRegionWithHost {
    return {
        name: partial.name ?? partial.$id,
        disabled: false,
        available: true,
        ...partial
    } as ConsoleRegionWithHost;
}

beforeEach(() => {
    setRegionHosts([]);
});

test('resolveRegionV1Endpoint returns null when catalog is empty', () => {
    expect(resolveRegionV1Endpoint('http:', 'fra')).toBeNull();
});

test('resolveRegionV1Endpoint returns null for default or missing region', () => {
    setRegionHosts([region({ $id: 'fra', hostname: 'fra.example.com' })]);
    expect(resolveRegionV1Endpoint('http:', 'default')).toBeNull();
    expect(resolveRegionV1Endpoint('http:', undefined)).toBeNull();
});

test('resolveRegionV1Endpoint prefers endpoint over hostname', () => {
    setRegionHosts([
        region({
            $id: 'nyc',
            hostname: 'nyc.example.com',
            endpoint: 'https://api.nyc.example.com'
        })
    ]);
    expect(resolveRegionV1Endpoint('http:', 'nyc')).toBe('https://api.nyc.example.com/v1');
});

test('resolveRegionV1Endpoint keeps /v1 on endpoint and strips trailing slash', () => {
    setRegionHosts([
        region({ $id: 'fra', endpoint: 'https://fra.example.com/v1/' }),
        region({ $id: 'syd', endpoint: 'https://syd.example.com/' })
    ]);
    expect(resolveRegionV1Endpoint('https:', 'fra')).toBe('https://fra.example.com/v1');
    expect(resolveRegionV1Endpoint('https:', 'syd')).toBe('https://syd.example.com/v1');
});

test('resolveRegionV1Endpoint builds URL from hostname and page protocol', () => {
    setRegionHosts([region({ $id: 'fra', hostname: 'fra.localhost' })]);
    expect(resolveRegionV1Endpoint('http:', 'fra')).toBe('http://fra.localhost/v1');
});

test('setRegionHosts replaces previous catalog entries', () => {
    setRegionHosts([region({ $id: 'fra', hostname: 'old.example.com' })]);
    setRegionHosts([region({ $id: 'nyc', hostname: 'nyc.example.com' })]);
    expect(resolveRegionV1Endpoint('http:', 'fra')).toBeNull();
    expect(resolveRegionV1Endpoint('http:', 'nyc')).toBe('http://nyc.example.com/v1');
});
