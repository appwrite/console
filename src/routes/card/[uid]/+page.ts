import { VARS } from '$lib/system.js';
import { redirect } from '@sveltejs/kit';

function getCardImgUrls(userId: string, endpoint: string) {
    const resolved = endpoint;

    const frontImg = `${resolved}/cards/cloud?userId=${userId}`;
    const backImg = `${resolved}/cards/cloud-back?userId=${userId}`;
    const ogImg = `${resolved}/cards/cloud-og?userId=${userId}`;

    return { frontImg, backImg, ogImg };
}

async function urlContentToDataUri(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise((callback) => {
        const reader = new FileReader();
        reader.onload = function () {
            if (typeof this.result !== 'string') return '';
            callback(this.result);
        };
        reader.readAsDataURL(blob);
    });
}

export async function load({ params, url, parent }) {
    const { account } = await parent();

    const userId = params.uid;
    const endpoint = VARS.APPWRITE_ENDPOINT ?? `${url.origin}/v1`;
    const { frontImg, backImg } = getCardImgUrls(userId, endpoint);

    const res = await fetch(frontImg);

    if (!res.ok) {
        throw redirect(303, '/');
    }

    return {
        userId: params.uid,
        base64: {
            front: await urlContentToDataUri(frontImg),
            back: await urlContentToDataUri(backImg)
        },
        isOwner: account && account.$id === userId,
        imgUrls: {
            frontImg,
            backImg
        }
    };
}
