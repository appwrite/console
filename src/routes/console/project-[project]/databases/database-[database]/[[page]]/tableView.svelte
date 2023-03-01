<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Copy, Pagination } from '$lib/components';
    import { PAGE_LIMIT } from '$lib/constants';
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
    import type { PageData } from './$types';

    export let data: PageData;
    export let columns: {
        id: string;
        name: string;
        width: number;
        show: boolean;
    }[];
    const project = $page.params.project;
    const databaseId = $page.params.database;
</script>

<TableScroll>
    <TableHeader>
        {#each columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.name}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.collections.collections as collection}
            <TableRowLink
                href={`${base}/console/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`}>
                {#each columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            <TableCell title={column.name}>
                                <Copy value={collection.$id}>
                                    <Pill button trim>
                                        <span class="icon-duplicate" aria-hidden="true" />
                                        <span class="text u-trim">{collection.$id}</span>
                                    </Pill>
                                </Copy>
                            </TableCell>
                        {:else if column.id === 'name'}
                            <TableCellText title={column.name}>
                                {collection.name}
                            </TableCellText>
                        {:else if column.id === '$updatedAt'}
                            <TableCellText title={column.name}>
                                {toLocaleDateTime(collection.$updatedAt)}
                            </TableCellText>
                        {:else if column.id === '$createdAt'}
                            <TableCellText title={column.name}>
                                {toLocaleDateTime(collection.$createdAt)}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</TableScroll>

<div class="u-flex u-margin-block-start-32 u-main-space-between">
    <p class="text">Total results: {data.collections.total}</p>
    <Pagination
        offset={data.offset}
        limit={PAGE_LIMIT}
        sum={data.collections.total}
        path={`/console/project-${$page.params.project}/databases`} />
</div>
