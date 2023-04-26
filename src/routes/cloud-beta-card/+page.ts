import { Mode, MODE } from '$lib/system';
import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
    if (MODE !== Mode.CLOUD) throw redirect(303, '/');
    const { account } = await parent();
    if (!account) throw redirect(303, '/login');
}
