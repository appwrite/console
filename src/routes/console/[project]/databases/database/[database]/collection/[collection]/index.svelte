<script lang="ts">
    import { page } from '$app/stores';
    import {
        Table,
        TableRowLink,
        TableBody,
        TableHeader,
        TableCellHead,
        TableCell
    } from '$lib/elements/table';
    import { Empty, Pagination, Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { collection, documentList } from './store';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import Create from './_create.svelte';

    let offset = 0;
    let showCreate = false;

    const limit = 5;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;

    onMount(async () => {
        await documentList.load($collection.$id, [], limit, offset);
    });

    $: columns = [
        ...$collection.attributes.map((attribute) => ({
            key: attribute.key,
            title: attribute.key
        }))
    ];
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Documents</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create document</span>
        </Button>
    </div>

    {#if $documentList?.total}
        <div class="table-wrapper">
            <Table sticky>
                <TableHeader>
                    <TableCellHead>Document ID</TableCellHead>
                    {#each columns as column}
                        <TableCellHead>{column.title}</TableCellHead>
                    {/each}
                </TableHeader>
                <TableBody>
                    {#each $documentList.documents as document}
                        <TableRowLink
                            href={`${base}/console/${projectId}/databases/database/${databaseId}/collection/${$collection.$id}/document/${document.$id}`}>
                            <TableCell main width={230}>
                                <Copy value={document.$id}>
                                    <Pill button>
                                        <span class="icon-duplicate" aria-hidden="true" />
                                        <span class="text u-trim-start">{document.$id}</span>
                                    </Pill>
                                </Copy>
                            </TableCell>
                            {#each columns as column}
                                <TableCell>
                                    {document[column.key] ?? 'n/a'}
                                </TableCell>
                            {/each}
                        </TableRowLink>
                    {/each}
                </TableBody>
            </Table>
        </div>
        <div class="u-flex common-section u-main-space-between">
            <p class="text">Total results: {$documentList.total}</p>
            <Pagination {limit} bind:offset sum={$documentList.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <span class="icon-plus" aria-hidden="true" />
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
</Container>

<Create bind:showCreate />
