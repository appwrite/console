<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Copy, CustomPagination } from '$lib/components';
    import { Dependencies, PAGE_LIMIT } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Writable } from 'svelte/store';
    import type { PageData } from './$types';
    import type { Column } from './store';

    export let data: PageData;
    export let columns: Writable<Column[]>;
    const project = $page.params.project;
    const databaseId = $page.params.database;
</script>

<TableScroll>
    <TableHeader>
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.collections.collections as collection}
            <TableRowLink
                href={`${base}/console/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`}>
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            <TableCell title={column.title}>
                                <Copy value={collection.$id}>
                                    <Pill button trim>
                                        <span class="icon-duplicate" aria-hidden="true" />
                                        <span class="text u-trim">{collection.$id}</span>
                                    </Pill>
                                </Copy>
                            </TableCell>
                        {:else if column.id === 'name'}
                            <TableCellText title={column.title}>
                                {collection.name}
                            </TableCellText>
                        {:else if column.id === '$updatedAt'}
                            <TableCellText title={column.title}>
                                {toLocaleDateTime(collection.$updatedAt)}
                            </TableCellText>
                        {:else if column.id === '$createdAt'}
                            <TableCellText title={column.title}>
                                {toLocaleDateTime(collection.$createdAt)}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</TableScroll>

<CustomPagination
    limit={PAGE_LIMIT}
    name="Collections"
    path={`/console/project-${$page.params.project}/databases/database-${$page.params.database}`}
    offset={data.offset}
    total={data.collections.total}
    dependencies={[Dependencies.DATABASE]} />
