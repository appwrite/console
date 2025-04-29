import { getApiEndpoint } from '$lib/stores/sdk';

export function getCardImgUrls(userId: string, endpoint: string) {
    const resolved = endpoint;

    const frontImg = `${resolved}/cards/cloud?userId=${userId}`;
    const backImg = `${resolved}/cards/cloud-back?userId=${userId}`;
    const ogImg = `${resolved}/cards/cloud-og?userId=${userId}`;

    return { frontImg, backImg, ogImg };
}

export function getCampaignImageUrl(image: string) {
    const endpoint = getApiEndpoint();
    const url = new URL(image, endpoint);
    return url.toString();
}
