import { goto } from '$app/navigation';
import { database } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';
import { getProjectRoute } from '$lib/helpers/project';

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
                    callback: () =>
                        goto(
                            getProjectRoute(
                                `/databases/database-${databaseId}/collection-${col.$id}`
                            )
                        )
                }) as const
        );
}) satisfies Searcher;
