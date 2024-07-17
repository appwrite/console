import { getApiEndpoint } from '$lib/stores/sdk';
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

export async function load({ params, parent }) {
    const { account } = await parent();
    const endpoint = getApiEndpoint();
    const userId = params.uid;
    const { frontImg, backImg } = getCardImgUrls(userId, endpoint);

    try {
        const res = await fetch(frontImg);

        if (!res.ok) {
            redirect(303, '/');
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
    } catch (e) {
        console.error(e);
        redirect(303, '/');
    }
}
