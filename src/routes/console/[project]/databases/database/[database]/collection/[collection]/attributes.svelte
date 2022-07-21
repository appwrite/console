<script lang="ts">
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCellText,
        TableCell
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { DropList, DropListItem, Empty, Pagination } from '$lib/components';
    import { collection } from './store';
    import type { Attributes } from './store';
    import { Container } from '$lib/layout';
    import { Pill } from '$lib/elements';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import Create from './_createAttribute.svelte';
    import CreateIndex from './_createIndex.svelte';
    import Delete from './_deleteAttribute.svelte';
    import Overview from './_overview.svelte';

    let offset = 0;
    const limit = 5;
    let showDropdown = [];
    let selectedAttribute: Attributes = null;
    let showCreate = false;
    let showDelete = false;
    let showOverview = false;
    let showCreateIndex = false;

    onMount(async () => {
        await collection.load($page.params.collection);
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Attributes</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create attribute</span>
        </Button>
    </div>

    {#if $collection?.attributes.length}
        <Table>
            <TableHeader>
                <TableCellHead>Key</TableCellHead>
                <TableCellHead>Type</TableCellHead>
                <TableCellHead>Default Value</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $collection.attributes as attribute, index}
                    <TableRow>
                        <TableCell main={true} title="Key">
                            <div class="u-flex u-main-space-between">
                                {attribute.key}
                                {#if attribute.status !== 'available'}
                                    <Pill
                                        warning={attribute.status === 'processing'}
                                        danger={['deleting', 'stuck', 'failed'].includes(
                                            attribute.status
                                        )}>
                                        {attribute.status}
                                    </Pill>
                                {:else if attribute.required}
                                    <Pill>Required</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Type">{attribute.type}</TableCellText>
                        <TableCellText title="Default Value">
                            {attribute.default ? attribute.default : '-'}
                        </TableCellText>
                        <TableCell showOverflow>
                            <DropList
                                bind:show={showDropdown[index]}
                                position="bottom"
                                horizontal="left"
                                arrow={false}>
                                <button
                                    class="button is-only-icon is-text"
                                    aria-label="More options"
                                    on:click|preventDefault={() => {
                                        showDropdown[index] = !showDropdown[index];
                                    }}>
                                    <span class="icon-dots-horizontal" aria-hidden="true" />
                                </button>
                                <svelte:fragment slot="list">
                                    <DropListItem
                                        icon="eye"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedAttribute = attribute;
                                            showOverview = true;
                                        }}>Overview</DropListItem>
                                    <DropListItem
                                        icon="plus"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedAttribute = attribute;
                                            showCreateIndex = true;
                                        }}>Create Index</DropListItem>
                                    <DropListItem
                                        icon="trash"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedAttribute = attribute;
                                            showDelete = true;
                                        }}>Delete</DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex common-section u-main-space-between">
            <p class="text">Total results: {$collection?.attributes?.length}</p>
            <Pagination {limit} bind:offset sum={$collection?.attributes?.length} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => console.log('showCreate = true')}>
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
{#if selectedAttribute}
    <Delete bind:showDelete {selectedAttribute} />
    <Overview bind:showOverview {selectedAttribute} />
    <CreateIndex bind:showCreateIndex externalAttribute={selectedAttribute} />
{/if}
