import { redirect } from '@sveltejs/kit';
import { getCardImgUrls } from '../helpers.js';

export async function load({ params }) {
    const userId = params.uid;
    const { frontImg } = getCardImgUrls(userId);

    const res = await fetch(frontImg);
    if (!res.ok) {
        throw redirect(303, '/');
    }

    return {
        userId: params.uid
    };
}
