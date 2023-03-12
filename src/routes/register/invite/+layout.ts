import { isSelfHosted } from '$lib/system';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    if (isSelfHosted) {
        throw error(501, 'Not available in self hosted.');
    }
};
