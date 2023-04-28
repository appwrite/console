import { VARS } from '$lib/system';

export function getCardImgUrls(userId: string) {
    const frontImg = `${VARS.APPWRITE_ENDPOINT}/cards/cloud?userId=${userId}`;
    const backImg = `${VARS.APPWRITE_ENDPOINT}/cards/cloud-back?userId=${userId}`;

    return { frontImg, backImg };
}
