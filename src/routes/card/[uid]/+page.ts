import { VARS } from '$lib/system.js';
import { redirect } from '@sveltejs/kit';
import { getCardImgUrls } from '../helpers.js';

export const ssr = true;

export async function load({ params, url }) {
    const userId = params.uid;
    const endpoint = VARS.APPWRITE_ENDPOINT ?? `${url.origin}/v1`;
    const { frontImg } = getCardImgUrls(userId, endpoint);

    const res = await fetch(frontImg);
    if (!res.ok) {
        throw redirect(303, '/');
    }

    return {
        userId: params.uid
    };
}
