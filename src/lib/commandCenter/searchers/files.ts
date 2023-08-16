import { sdk } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { bucket } from '$routes/console/project-[project]/storage/bucket-[bucket]/store';
import { Query } from '@appwrite.io/console';
import { goto } from '$app/navigation';
import { project } from '$routes/console/project-[project]/store';

export const fileSearcher = (async (query: string) => {
    const $bucket = get(bucket);
    const $project = get(project);

    const { files } = await sdk.forProject.storage.listFiles(
        $bucket.$id,
        [Query.orderDesc('')],
        query || undefined
    );

    return files.map((file) => ({
        label: file.name,
        callback: () => {
            goto(`/console/project-${$project.$id}/storage/bucket-${$bucket.$id}/file-${file.$id}`);
        },
        icon: 'document',
        group: 'files'
    }));
}) satisfies Searcher;
