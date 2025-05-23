import { sdk } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { bucket } from '$routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/store';
import { Query } from '@appwrite.io/console';
import { goto } from '$app/navigation';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { base } from '$app/paths';
import { IconDocument } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';

export const fileSearcher = (async (query: string) => {
    const $bucket = get(bucket);
    const $project = get(project);

    const { files } = await sdk
        .forProject(page.params.region, page.params.project)
        .storage.listFiles($bucket.$id, [Query.orderDesc('')], query || undefined);

    return files.map((file) => ({
        label: file.name,
        callback: () => {
            goto(
                `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${$bucket.$id}/file-${file.$id}`
            );
        },
        icon: IconDocument,
        group: 'files'
    }));
}) satisfies Searcher;
