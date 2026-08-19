import { getApiEndpoint } from '$lib/stores/sdk';

export function getCampaignImageUrl(image: string) {
    const endpoint = getApiEndpoint();
    const url = new URL(image, endpoint);
    return url.toString();
}
