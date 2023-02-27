<script lang="ts">
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
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<TableScroll>
    <TableHeader>
        <TableCellHead width={50}>Collection ID</TableCellHead>
        <TableCellHead width={100}>Name</TableCellHead>
        <TableCellHead width={100}>Updated At</TableCellHead>
        <TableCellHead width={100}>Created At</TableCellHead>
    </TableHeader>
    <TableBody>
        {#each data.databases.databases as database}
            <TableRow>
                <TableCell title="Deployment ID">
                    <Copy value={database.$id}>
                        <Pill button trim>
                            <span class="icon-duplicate" aria-hidden="true" />
                            <span class="text u-trim">{database.$id}</span>
                        </Pill>
                    </Copy>
                </TableCell>
                <TableCellText title="Name">
                    {database.name}
                </TableCellText>
                <TableCellText title="Updated">
                    {toLocaleDateTime(database.$updatedAt)}
                </TableCellText>
                <TableCellText title="Created">
                    {toLocaleDateTime(database.$createdAt)}
                </TableCellText>
            </TableRow>
        {/each}
    </TableBody>
</TableScroll>

<div class="u-flex u-margin-block-start-32 u-main-space-between">
    <p class="text">Total results: {data.databases.total}</p>
    <Pagination
        offset={data.offset}
        limit={PAGE_LIMIT}
        sum={data.databases.total}
        path={`/console/project-${$page.params.project}/databases`} />
</div>
