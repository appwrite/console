import { get } from 'svelte/store';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/stores';

export async function load({ params }) {
    const bucket = get(page)?.data?.bucket;

    if (!bucket) {
        return {
            bucket: await sdk.forProject.storage.getBucket(params.bucket)
        };
    } else {
        return {
            bucket
        };
    }
}
