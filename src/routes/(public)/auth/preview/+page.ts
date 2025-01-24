import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
    const { account } = await parent();

    if (!account) {
        redirect(303, `${base}/auth/preview/access`);
    } else {
        return {
            account
        };
    }
};
