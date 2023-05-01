import { VARS } from '$lib/system.js';
import { redirect } from '@sveltejs/kit';
import { getCardImgUrls } from '../helpers.js';

export const ssr = false;

function urlContentToDataUri(url) {
    return fetch(url)
        .then((response) => response.blob())
        .then(
            (blob) =>
                new Promise((callback) => {
                    const reader = new FileReader();
                    reader.onload = function () {
                        callback(this.result);
                    };
                    reader.readAsDataURL(blob);
                })
        );
}

export async function load({ params, url }) {
    const userId = params.uid;
    const endpoint = VARS.APPWRITE_ENDPOINT ?? `${url.origin}/v1`;
    const { frontImg, backImg } = getCardImgUrls(userId, endpoint);

    const res = await fetch(frontImg);

    if (!res.ok) {
        throw redirect(303, '/');
    }

    return {
        userId: params.uid,
        frontBase64: await urlContentToDataUri(frontImg)
    };
}
