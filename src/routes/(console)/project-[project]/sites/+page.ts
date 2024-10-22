import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';

export const load = async ({ url, depends, route }) => {
    depends(Dependencies.SITES);

    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    const siteList = {
        sites: mockSites.slice(offset, offset + limit),
        total: mockSites.length
    };

    return {
        offset,
        limit,
        siteList
    };
};

const mockSites = [
    {
        preview: 'https://unsplash.it/300/200',
        name: 'Site 1',
        framework: 'react',
        status: 'published',
        domain: 'site1.com',
        url: 'https://site1.com',
        $id: '67162a760002e51a921a',
        $createdAt: '1620000000',
        $updatedAt: '1620000000'
    },
    {
        preview: 'https://unsplash.it/301/200',
        name: 'Site 2',
        framework: 'vue',
        status: 'published',
        domain: 'site2.com',
        url: 'https://site2.com',
        $id: '27162a760002e51a921a',
        $createdAt: '1620000000',
        $updatedAt: '1620000000'
    },
    {
        preview: 'https://unsplash.it/302/200',
        name: 'Site 3',
        framework: 'angular',
        status: 'published',
        domain: 'site3.com',
        url: 'https://site3.com',
        $id: '67162a760002e51a933a',
        $createdAt: '1620000000',
        $updatedAt: '1620000000'
    },
    {
        preview: 'https://unsplash.it/303/200',
        name: 'Site 4',
        framework: 'react',
        status: 'published',
        domain: 'site4.com',
        url: 'https://site4.com',
        $id: '67162a760002e51w921a',
        $createdAt: '1620005000',
        $updatedAt: '1620000000'
    },
    {
        preview: 'https://unsplash.it/304/200',
        name: 'Site 5 with a very long name that should be truncated',
        framework: 'vue',
        status: 'published',
        domain: 'site5.com',
        url: 'https://site5.com',
        $id: '67162a76000we51a921a',
        $createdAt: '1620000000',
        $updatedAt: '1650000000'
    },
    {
        preview: 'https://unsplash.it/300/201',
        name: 'Site 6',
        framework: 'angular',
        status: 'published',
        domain: 'site6.com',
        url: 'https://site6.com',
        $id: '67163a760002e51a921a',
        $createdAt: '1620000000',
        $updatedAt: '1640000000'
    },
    {
        preview: 'https://unsplash.it/300/202',
        name: 'Site 7',
        framework: 'react',
        status: 'published',
        domain: 'site7.com',
        url: 'https://site7.com',
        $id: '67162a760002e51a942a',
        $createdAt: '1620000000',
        $updatedAt: '1620030000'
    }
];
