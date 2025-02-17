import { PAGE_LIMIT } from '$lib/constants';
import { Dependencies } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { getLimit } from '$lib/helpers/load';
import { getPage } from '$lib/helpers/load';

export const load = async ({ parent, depends, url, route }) => {
    depends(Dependencies.DOMAIN);

    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const { domain } = await parent();

    return {
        domain,
        records: mockDNSRecords,
        offset,
        limit
    };
};

const mockDNSRecords = {
    total: 4,
    records: [
        {
            type: 'A',
            name: '@',
            value: '192.0.2.1',
            ttl: 3600,
            proxied: true,
            $createdAt: '2023-01-15T10:30:00Z'
        },
        {
            type: 'CNAME',
            name: 'www',
            value: 'example.com',
            ttl: 3600,
            proxied: true,
            $createdAt: '2023-01-15T10:30:00Z'
        },
        {
            type: 'MX',
            name: '@',
            value: 'mail.example.com',
            priority: 10,
            ttl: 3600,
            proxied: false,
            $createdAt: '2023-01-15T10:30:00Z'
        },
        {
            type: 'TXT',
            name: '@',
            value: 'v=spf1 include:_spf.example.com ~all',
            ttl: 3600,
            proxied: false,
            $createdAt: '2023-01-15T10:30:00Z'
        }
    ]
};
