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
</script>

<TableScroll>
    <TableHeader>
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.name}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.databases.databases as database}
            <TableRowLink
                href={`${base}/console/project-${project}/databases/database-${database.$id}`}>
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            <TableCell title={column.name}>
                                <Copy value={database.$id}>
                                    <Pill button trim>
                                        <span class="icon-duplicate" aria-hidden="true" />
                                        <span class="text u-trim">{database.$id}</span>
                                    </Pill>
                                </Copy>
                            </TableCell>
                        {:else if column.id === 'name'}
                            <TableCellText title={column.name}>
                                {database.name}
                            </TableCellText>
                        {:else if column.id === '$updatedAt'}
                            <TableCellText title={column.name}>
                                {toLocaleDateTime(database.$updatedAt)}
                            </TableCellText>
                        {:else if column.id === '$createdAt'}
                            <TableCellText title={column.name}>
                                {toLocaleDateTime(database.$createdAt)}
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
    name="Databases"
    path={`/console/project-${$page.params.project}/databases`}
    offset={data.offset}
    total={data.databases.total}
    dependencies={[Dependencies.DATABASES]} />
