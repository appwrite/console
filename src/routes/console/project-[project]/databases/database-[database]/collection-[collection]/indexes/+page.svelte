<script lang="ts">
    import { Empty, EmptySearch, Search, DropList, DropListItem } from '$lib/components';
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
    import { collection } from '../store';
    import Delete from './deleteIndex.svelte';
    import Create from './createIndex.svelte';
    import Overview from './overviewIndex.svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let data: PageData;

    let showDropdown = [];
    let selectedIndex: Models.Index = null;
    let showCreateIndex = false;
    let showOverview = false;
    let showDelete = false;
    let search = '';

    const handleDelete = async () => {
        invalidate(Dependencies.INDEXES);
    };
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
    {#if data.indexes.total}
        <Table>
            <TableHeader>
                <TableCellHead>Key</TableCellHead>
                <TableCellHead>Type</TableCellHead>
                <TableCellHead>Attributes</TableCellHead>
                <TableCellHead>Asc/Desc</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each data.indexes.indexes as index, i}
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
                            <DropList bind:show={showDropdown[i]} placement="bottom-start" noArrow>
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
            <p class="text">Total results: {data.indexes.total}</p>
            <!-- <Pagination limit={$pageLimit} bind:offset sum={data.indexes.total} /> -->
        </div>
    {:else if search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <p>There are no indexes that match your search.</p>
            </div>
            <Button secondary on:click={() => (search = '')}>Clear Search</Button>
        </EmptySearch>
    {:else if $collection.indexes?.length}
        <Empty isButton single on:click={() => (showCreateIndex = true)}>
            <p>Create your first attribute to get started</p>
        </Empty>
    {:else}
        <Empty isButton single on:click={() => (showCreateIndex = true)}>
            <p>Create your first index to get started</p>
        </Empty>
    {/if}
</Container>

<Create bind:showCreateIndex />
{#if selectedIndex}
    <Delete bind:showDelete {selectedIndex} on:deleted={handleDelete} />
    <Overview bind:showOverview {selectedIndex} />
{/if}
