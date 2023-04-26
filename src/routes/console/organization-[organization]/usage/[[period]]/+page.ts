import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

const MOCKDATA = [
    {
        name: 'test',
        projectUsage: [
            {
                name: 'Bandwidth',
                icon: 'chart-bar',
                unit: 'GB',
                max: 16,
                used: 8,
                status: null
            },
            {
                name: 'Storage',
                icon: 'folder',
                unit: 'GB',
                max: 3.5,
                used: 3.7,
                status: 'error'
            },
            {
                name: 'Compute',
                icon: 'lightning-bolt',
                unit: 'hrs',
                max: 2,
                used: 1.8,
                status: 'warning'
            }
        ]
    },
    {
        name: 'Lol',
        projectUsage: [
            {
                name: 'Bandwidth',
                icon: 'chart-bar',
                unit: 'GB',
                max: 16,
                used: 8,
                status: null
            },
            {
                name: 'Storage',
                icon: 'folder',
                unit: 'GB',
                max: 10.5,
                used: 3.7,
                status: null
            },
            {
                name: 'Compute',
                icon: 'lightning-bolt',
                unit: 'hrs',
                max: 2,
                used: 1.5,
                status: null
            }
        ]
    }
];

export const load: PageLoad = async ({ params }) => {
    try {
        return { usageData: MOCKDATA };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
