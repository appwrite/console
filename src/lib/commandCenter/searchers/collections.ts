import { goto } from '$app/navigation';
import { database } from '$routes/(console)/project-[project]/databases/database-[database]/store';
import { project } from '$routes/(console)/project-[project]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';

export const collectionsSearcher = (async (query: string) => {
    const databaseId = get(database).$id;
    const { collections } = await sdk.forProject.databases.listCollections(databaseId);

    const projectId = get(project).$id;
    return collections
        .filter((col) => col.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (col) =>
                ({
                    group: 'collections',
                    label: col.name,
                    callback: () => {
                        goto(
                            `${base}/project-${projectId}/databases/database-${databaseId}/table-${col.$id}`
                        );
                    }
                }) as const
        );
}) satisfies Searcher;
