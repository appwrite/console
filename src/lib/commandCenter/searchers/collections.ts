import { goto } from '$app/navigation';
import { database } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';
import { page } from '$app/state';

export const collectionsSearcher = (async (query: string) => {
    const databaseId = get(database).$id;
    const { collections } = await sdk
        .forProject(page.params.region, page.params.project)
        .databases.listCollections(databaseId);

    return collections
        .filter((col) => col.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (col) =>
                ({
                    group: 'collections',
                    label: col.name,
                    callback: () => {
                        goto(
                            `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/collection-${col.$id}`
                        );
                    }
                }) as const
        );
}) satisfies Searcher;
