<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRowLink
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { columns } from './store';
    import type { PageData } from './$types';

    export let data: PageData;
    const projectId = $page.params.project;
</script>

<Table>
    <TableHeader order={data.order}>
        {#each $columns as column}
            {#if column.show}
                <TableCellHead {column} width={column.width}>
                    {column.title}
                </TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.databases.databases as database}
            <TableRowLink
                href={`${base}/console/project-${projectId}/databases/database-${database.$id}`}>
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key $columns}
                                <TableCell width={column.width} title={column.title}>
                                    <Copy value={database.$id}>
                                        <Pill button trim>
                                            <span class="icon-duplicate" aria-hidden="true" />
                                            <span class="text u-trim">{database.$id}</span>
                                        </Pill>
                                    </Copy>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'name'}
                            <TableCellText width={column.width} title={column.title}>
                                {database.name}
                            </TableCellText>
                        {:else}
                            <TableCellText width={column.width} title={column.title}>
                                {toLocaleDateTime(database[column.id])}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</Table>
