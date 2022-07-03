<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import {
        Table,
        TableRow,
        TableBody,
        TableHeader,
        TableCellHead,
        TableCellLink
    } from '$lib/elements/table';
    import { Empty, Pagination, Search } from '$lib/components';
    import { collection } from './store';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';

    let offset = 0;
    let search = '';

    const limit = 12;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;

    $: request = sdkForProject.databases.listDocuments($collection.$id, [], limit, offset);
    $: columns = [
        { key: '$id', title: 'ID' },
        ...$collection.attributes.map((attribute) => ({
            key: attribute.key,
            title: attribute.key
        }))
    ];
</script>

<Container>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        <Search bind:search placeholder="Search by ID">
            <Button on:click={() => console.log('showCreate = true')}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create Document</span>
            </Button>
        </Search>
        {#if response.total}
            <Table>
                <TableHeader>
                    {#each columns as column}
                        <TableCellHead>{column.title}</TableCellHead>
                    {/each}
                </TableHeader>
                <TableBody>
                    {#each response.documents as document}
                        <TableRow>
                            {#each columns as column}
                                <TableCellLink
                                    href={`${base}/console/${projectId}/databases/database/${databaseId}/collection/${$collection.$id}/document/${document.$id}`}
                                    title={column.title}>
                                    {document[column.key] ?? 'n/a'}
                                </TableCellLink>
                            {/each}
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>

            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {response.total}</p>
                <Pagination {limit} bind:offset sum={response.total} />
            </div>
        {:else}
            <Empty dashed centered>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <Button secondary round on:click={() => console.log('showCreate = true')}>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Crate your first document to get started</p>
                    </div>
                    <div class="common-section">
                        <Button secondary href="#">Documentation</Button>
                    </div>
                </div>
            </Empty>
        {/if}
    {/await}
</Container>
