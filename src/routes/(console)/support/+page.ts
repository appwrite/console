import { base } from '$app/paths';
import { isCloud } from '$lib/system.js';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
    if (!isCloud) {
        redirect(303, base);
    }
};
