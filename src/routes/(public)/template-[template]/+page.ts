import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
    const { account } = await parent();

    // const params = new URLSearchParams(window.location.search);

    if (account) {
        redirect(303, `${base}/templates-[template]?type=${url.searchParams.get('type')}`);
    } else {
        return {};
    }
};
