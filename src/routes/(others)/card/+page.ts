import { base } from '$app/paths';
import { isCloud } from '$lib/system';
import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
    if (!isCloud) redirect(303, base);
    const { account } = await parent();
    if (!account) redirect(303, `${base}/login`);

    redirect(303, `${base}/card/${account.$id}`);
}
