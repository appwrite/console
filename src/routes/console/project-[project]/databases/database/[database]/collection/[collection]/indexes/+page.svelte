<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, Pagination, Search, DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import {
        Table,
        TableHeader,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableRow
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { indexList, collection } from '../store';
    import { onMount } from 'svelte';
    import Delete from '../_deleteIndex.svelte';
    import Create from '../_createIndex.svelte';
    import Overview from '../_overviewIndex.svelte';
    import type { Models } from '@aw-labs/appwrite-console';

    let showDropdown = [];
    let selectedIndex: Models.Index = null;
    let showCreateIndex = false;
    let showOverview = false;
    let showDelete = false;
    let search = '';
    let offset: number = null;

    const limit = 5;
    const collectionId = $page.params.collection;
    const databaseId = $page.params.database;

    const handleDelete = async () => {
        await indexList.load(databaseId, collectionId);
    };

    // $: indexes.load(search);
    // $: if (search) offset = 0;
    // $: {
    //     //TODO: refactor this into something maintainable without the use of goto
    //     if (offset !== null) {
    //         $page.url.searchParams.set('offset', offset.toString());
    //         goto(`?${$page.url.searchParams.toString()}`, { replaceState: true, keepfocus: true });
    //     }
    // }

    // onMount(() => {
    //     const queryOffset = +$page.url.searchParams.get('offset') ?? 0;
    //     if (offset && offset !== queryOffset) {
    //         offset = queryOffset;
    //     }
    // });

    onMount(async () => {
        await indexList.load(databaseId, collectionId);
    });
</script>

<Container>
    <Search bind:search placeholder="Search by key or type">
        <span>
            <Button
                disabled={!$collection.attributes?.length}
                on:click={() => (showCreateIndex = true)}>
                <span class="icon-plus" aria-hidden="true" /> <span class="text">Create index</span>
            </Button>
        </span>
    </Search>
    {#if $indexList?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Key</TableCellHead>
                <TableCellHead>Type</TableCellHead>
                <TableCellHead>Attributes</TableCellHead>
                <TableCellHead>Asc/Desc</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $indexList.indexes as index, i}
                    <TableRow>
                        <TableCell title="Key">
                            <div class="u-flex u-main-space-between">
                                <span class="text u-trim"> {index.key}</span>
                                {#if index.status !== 'available'}
                                    <Pill
                                        warning={index.status === 'processing'}
                                        danger={['deleting', 'stuck', 'failed'].includes(
                                            index.status
                                        )}>
                                        {index.status}
                                    </Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Type">{index.type}</TableCellText>
                        <TableCellText title="Attributes">
                            {index.attributes}
                        </TableCellText>
                        <TableCellText title="ASC/DESC">
                            {index.orders}
                        </TableCellText>
                        <TableCell showOverflow>
                            <DropList
                                bind:show={showDropdown[i]}
                                position="bottom"
                                horizontal="left"
                                arrow={false}>
                                <button
                                    class="button is-only-icon is-text"
                                    aria-label="More options"
                                    on:click|preventDefault={() => {
                                        showDropdown[i] = !showDropdown[i];
                                    }}>
                                    <span class="icon-dots-horizontal" aria-hidden="true" />
                                </button>
                                <svelte:fragment slot="list">
                                    <DropListItem
                                        icon="eye"
                                        on:click={() => {
                                            selectedIndex = index;
                                            showOverview = true;
                                        }}>Overview</DropListItem>

                                    <DropListItem
                                        icon="trash"
                                        on:click={() => {
                                            selectedIndex = index;
                                            showDelete = true;
                                        }}>Delete</DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$indexList?.total}</p>
            <Pagination {limit} bind:offset sum={$indexList?.total} />
        </div>
    {:else if search}
        <Empty>
            <div class="u-flex u-flex-vertical">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <div class="common-section">
                    <p>There are no indexes that match your search.</p>
                </div>
                <div class="common-section">
                    <Button secondary on:click={() => (search = '')}>Clear Search</Button>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$indexList?.total}</p>
            <Pagination {limit} bind:offset sum={$indexList?.total} />
        </div>
    {:else if $collection.indexes?.length}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreateIndex = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Create your first attribute to get started</p>
                </div>
                <div class="common-section">
                    <Button secondary href="#?">Documentation</Button>
                </div>
            </div>
        </Empty>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreateIndex = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Create your first index to get started</p>
                </div>
                <div class="common-section">
                    <Button secondary href="#">Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreateIndex />
{#if selectedIndex}
    <Delete bind:showDelete {selectedIndex} on:deleted={handleDelete} />
    <Overview bind:showOverview {selectedIndex} />
{/if}
