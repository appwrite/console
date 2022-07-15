<script lang="ts">
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCellText
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { DropList, DropListItem, Empty, Pagination } from '$lib/components';
    import { collection } from './store';
    // import type { Attributes } from './store';
    import { Container } from '$lib/layout';
    import { Pill } from '$lib/elements';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import Create from './_createAttribute.svelte';
    import type { Models } from '@aw-labs/appwrite-console';

    let offset = 0;
    const limit = 5;
    let showDropdown = [];
    // let selectedAttribute: Attributes = null;
    // let showDelete = false;
    let showCreate = false;

    const handleCreate = async (event: CustomEvent<Models.Collection>) => {
        showCreate = false;
        console.log(event);
    };

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
                        <TableCellText title="Key"
                            >{attribute.key}
                            {#if attribute.status !== 'available'}
                                <Pill
                                    warning={attribute.status === 'processing'}
                                    danger={['deleting', 'stuck', 'failed'].includes(
                                        attribute.status
                                    )}>
                                    {attribute.status}
                                </Pill>
                            {/if}
                        </TableCellText>
                        <TableCellText title="Type">{attribute.type}</TableCellText>
                        <TableCellText title="Default Value">
                            {attribute.xdefault ? attribute.xdefault : '-'}
                        </TableCellText>
                        <TableCellText showOverflow title="">
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
                                    <DropListItem icon="eye">Overview</DropListItem>
                                    <DropListItem icon="plus">Create Index</DropListItem>
                                    <DropListItem
                                        icon="trash"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            // selectedAttribute = attribute;
                                            // showDelete = true;
                                        }}>Delete</DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </TableCellText>
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

<Create bind:showCreate on:created={handleCreate} />
