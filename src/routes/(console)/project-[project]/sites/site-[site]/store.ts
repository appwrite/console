import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const site = derived(page, ($page) => $page.data.site as Models.Site);

export function deploymentStatusConverter(status: string) {
    // Status component possible values - status: 'waiting' | 'ready' | 'processing' | 'pending' | 'failed' | 'complete';
    switch (status) {
        case 'ready':
            return 'ready';
        case 'processing':
            return 'processing';
        case 'building':
            return 'pending';
        case 'failed':
            return 'failed';
    }
}
