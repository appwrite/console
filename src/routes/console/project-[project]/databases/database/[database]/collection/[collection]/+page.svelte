<script lang="ts">
    import { page } from '$app/stores';
    import {
        TableScroll,
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
    import { wizard } from '$lib/stores/wizard';
    import Create from './createDocument.svelte';
    import { Query } from '@aw-labs/appwrite-console';
    import { pageLimit } from '$lib/stores/layout';

    let offset = 0;

    const projectId = $page.params.project;
    const databaseId = $page.params.database;

    $: documentList.load(databaseId, $collection.$id, [
        Query.limit($pageLimit),
        Query.offset(offset),
        Query.orderDesc('$createdAt')
    ]);
    $: columns = [
        ...$collection.attributes.map((attribute) => ({
            key: attribute.key,
            title: attribute.key
        }))
    ];

    function openWizard() {
        wizard.start(Create);
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Documents</h2>

        <Button disabled={!$collection?.attributes?.length} on:click={openWizard}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create document</span>
        </Button>
    </div>

    {#if $collection?.attributes?.length}
        {#if $documentList?.total}
            <TableScroll>
                <TableHeader>
                    <TableCellHead>Document ID</TableCellHead>
                    {#each columns as column}
                        <TableCellHead>{column.title}</TableCellHead>
                    {/each}
                </TableHeader>
                <TableBody>
                    {#each $documentList.documents as document}
                        <TableRowLink
                            href={`${base}/console/project-${projectId}/databases/database/${databaseId}/collection/${$collection.$id}/document/${document.$id}`}>
                            <TableCell width={230}>
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
            </TableScroll>

            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {$documentList.total}</p>
                <Pagination limit={$pageLimit} bind:offset sum={$documentList.total} />
            </div>
        {:else}
            <Empty isButton single on:click={openWizard}>
                <p>Create your first document to get started</p>
            </Empty>
        {/if}
    {:else}
        <Empty single>
            <p>Create your first attribute to get started</p>
        </Empty>
    {/if}
</Container>
