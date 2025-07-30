import { goto } from '$app/navigation';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';
import { page } from '$app/state';

export const tablesSearcher = (async (query: string) => {
    const databaseId = page.params.database;
    const { tables } = await sdk
        .forProject(page.params.region, page.params.project)
        .grids.listTables(databaseId);

    return tables
        .filter((table) => table.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (table) =>
                ({
                    group: 'tables',
                    label: table.name,
                    callback: () => {
                        goto(
                            `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${table.$id}`
                        );
                    }
                }) as const
        );
}) satisfies Searcher;
