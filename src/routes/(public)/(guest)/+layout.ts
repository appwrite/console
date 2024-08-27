import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
    const { account } = await parent();

    if (account) {
        redirect(303, base);
    }
};
