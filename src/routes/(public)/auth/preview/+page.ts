import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
    const { account } = await parent();

    const projectId = url.searchParams.get('projectId');
    const origin = url.searchParams.get('origin');
    const path = url.searchParams.get('path');

    if (!account) {
        redirect(
            303,
            `${base}/auth/preview/access?origin=${origin}&path=${path}&projectId=${projectId}`
        );
    } else {
        return {
            account
        };
    }
};
