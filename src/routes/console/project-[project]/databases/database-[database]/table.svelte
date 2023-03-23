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
    import type { PageData } from './$types';
    import { columns } from './store';

    export let data: PageData;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;
</script>

<Table>
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
                href={`${base}/console/project-${projectId}/databases/database-${databaseId}/collection-${collection.$id}`}>
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key $columns}
                                <TableCell title={column.title}>
                                    <Copy value={collection.$id}>
                                        <Pill button trim>
                                            <span class="icon-duplicate" aria-hidden="true" />
                                            <span class="text u-trim">{collection.$id}</span>
                                        </Pill>
                                    </Copy>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'name'}
                            <TableCellText title={column.title}>
                                {collection.name}
                            </TableCellText>
                        {:else}
                            <TableCellText title={column.title}>
                                {toLocaleDateTime(collection[column.id])}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</Table>
