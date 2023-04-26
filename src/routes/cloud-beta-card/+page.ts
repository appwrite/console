import { isCloud } from '$lib/system';
import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
    if (!isCloud) throw redirect(303, '/');
    const { account } = await parent();
    if (!account) throw redirect(303, '/login');
}
