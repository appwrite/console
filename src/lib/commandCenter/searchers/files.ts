import { sdk } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { bucket } from '$routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/store';
import { Query } from '@appwrite.io/console';
import { goto } from '$app/navigation';
import { IconDocument } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';
import { getProjectRoute } from '$lib/helpers/project';

export const fileSearcher = (async (query: string) => {
    const $bucket = get(bucket);

    const { files } = await sdk
        .forProject(page.params.region, page.params.project)
        .storage.listFiles($bucket.$id, [Query.orderDesc('')], query || undefined);

    return files.map((file) => ({
        label: file.name,
        callback: () => goto(getProjectRoute(`/storage/bucket-${$bucket.$id}/file-${file.$id}`)),
        icon: IconDocument,
        group: 'files'
    }));
}) satisfies Searcher;
