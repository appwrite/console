import { isCloud } from '$lib/system';
import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
    if (!isCloud) redirect(303, '/');
    const { account } = await parent();
    if (!account) redirect(303, '/login');
}
