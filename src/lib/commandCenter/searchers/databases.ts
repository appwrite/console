import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';
import { page } from '$app/stores';

export const dbSearcher = (async (query: string) => {
    const $page = get(page);
    const { databases } = await sdk
        .forProject($page.params.region, $page.params.project)
        .databases.list();

    return databases
        .filter((db) => db.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (db) =>
                ({
                    group: 'databases',
                    label: db.name,
                    callback: () => {
                        goto(
                            `${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${db.$id}`
                        );
                    },
                    icon: 'database'
                }) as const
        );
}) satisfies Searcher;
