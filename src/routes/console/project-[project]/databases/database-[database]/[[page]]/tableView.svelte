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
    const project = $page.params.project;
    const databaseId = $page.params.database;
</script>

<TableScroll>
    <TableHeader>
        <TableCellHead width={45}>Collection ID</TableCellHead>
        <TableCellHead width={100}>Name</TableCellHead>
        <TableCellHead width={100}>Updated At</TableCellHead>
        <TableCellHead width={100}>Created At</TableCellHead>
    </TableHeader>
    <TableBody>
        {#each data.collections.collections as collection}
            <TableRowLink
                href={`${base}/console/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`}>
                <TableCell title="Deployment ID">
                    <Copy value={collection.$id}>
                        <Pill button trim>
                            <span class="icon-duplicate" aria-hidden="true" />
                            <span class="text u-trim">{collection.$id}</span>
                        </Pill>
                    </Copy>
                </TableCell>
                <TableCellText title="Name">
                    {collection.name}
                </TableCellText>
                <TableCellText title="Updated">
                    {toLocaleDateTime(collection.$updatedAt)}
                </TableCellText>
                <TableCellText title="Created">
                    {toLocaleDateTime(collection.$createdAt)}
                </TableCellText>
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
