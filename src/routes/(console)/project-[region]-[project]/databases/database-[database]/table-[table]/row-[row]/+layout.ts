import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import type { Columns } from '../store';
import { buildWildcardColumnsQuery } from './columns/store';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.ROW);
    const { table } = await parent();

    const row = await sdk
        .forProject(params.region, params.project)
        .tables.getRow(params.database, params.table, params.row, buildWildcardColumnsQuery(table));

    /**
     * Sanitize DateTime to remove UTC Timezone section.
     */
    table.columns.forEach((column) => {
        const { type, key, array } = column as unknown as Columns;
        if (type === 'datetime') {
            if (array) {
                row[key] = row[key].map((n: string) => {
                    if (!n) {
                        return null;
                    }
                    return new Date(n).toISOString().slice(0, 23);
                });
            } else {
                if (row[key]) {
                    row[key] = new Date(row[key]).toISOString().slice(0, 23);
                } else {
                    row[key] = null;
                }
            }
        }
    });

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        row
    };
};
