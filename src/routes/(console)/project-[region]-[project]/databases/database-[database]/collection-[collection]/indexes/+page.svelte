<script lang="ts">
    import { Empty, DropList, DropListItem, Heading } from '$lib/components';
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
    import { collection, indexes } from '../store';
    import Delete from './deleteIndex.svelte';
    import Create from './createIndex.svelte';
    import Overview from './overviewIndex.svelte';
    import CreateAttribute from '../createAttribute.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import CreateAttributeDropdown from '../attributes/createAttributeDropdown.svelte';
    import type { Option } from '../attributes/store';
    import FailedModal from '../failedModal.svelte';
    import { canWriteCollections } from '$lib/stores/roles';

    let showDropdown = [];
    let selectedIndex: Models.Index = null;
    let showCreateIndex = false;
    let showOverview = false;
    let showDelete = false;
    let showCreateAttribute = false;
    let showCreateDropdown = false;
    let selectedAttribute: Option['name'] = null;
    let showFailed = false;
    let error = '';
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Indexes</Heading>

        {#if $canWriteCollections}
            <Button
                event="create_index"
                disabled={!$collection?.attributes?.length}
                on:click={() => (showCreateIndex = true)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create index</span>
            </Button>
        {/if}
    </div>
    {#if $collection?.attributes?.length}
        {#if $indexes.length}
            <Table>
                <TableHeader>
                    <TableCellHead>Key</TableCellHead>
                    <TableCellHead onlyDesktop>Type</TableCellHead>
                    <TableCellHead onlyDesktop>Attributes</TableCellHead>
                    <TableCellHead onlyDesktop>Asc/Desc</TableCellHead>
                    <TableCellHead width={30} />
                </TableHeader>
                <TableBody>
                    {#each $indexes as index, i}
                        <TableRow>
                            <TableCell title="Key">
                                <div class="u-flex u-main-space-between">
                                    <span class="text u-trim"> {index.key}</span>
                                    {#if index.status !== 'available'}
                                        <div class="u-inline-flex u-gap-12 u-cross-center">
                                            <Pill
                                                warning={index.status === 'processing'}
                                                danger={['deleting', 'stuck', 'failed'].includes(
                                                    index.status
                                                )}>
                                                {index.status}
                                            </Pill>
                                            {#if index.error}
                                                <Button
                                                    link
                                                    on:click={(e) => {
                                                        e.preventDefault();
                                                        error = index.error;
                                                        showFailed = true;
                                                    }}>Details</Button>
                                            {/if}
                                        </div>
                                    {/if}
                                </div>
                            </TableCell>
                            <TableCellText title="Type" onlyDesktop>{index.type}</TableCellText>
                            <TableCellText title="Attributes" onlyDesktop>
                                {index.attributes}
                            </TableCellText>
                            <TableCellText title="ASC/DESC" onlyDesktop>
                                {index.orders}
                            </TableCellText>
                            <TableCell showOverflow>
                                <DropList
                                    bind:show={showDropdown[i]}
                                    placement="bottom-start"
                                    noArrow>
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
                <p class="text">Total results: {$indexes.length}</p>
            </div>
        {:else}
            <Empty
                allowCreate={$canWriteCollections}
                single
                href="https://appwrite.io/docs/products/databases/collections#indexes"
                target="index"
                on:click={() => (showCreateIndex = true)} />
        {/if}
    {:else}
        <Empty
            single
            target="attribute"
            allowCreate={$canWriteCollections}
            on:click={() => (showCreateDropdown = true)}>
            <div class="u-text-center">
                <Heading size="7" tag="h2">Create an attribute to get started.</Heading>
                <p class="body-text-2 u-bold u-margin-block-start-4">
                    Need a hand? Learn more in our documentation.
                </p>
            </div>
            <div class="u-flex u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/products/databases/collections#attributes"
                    text
                    event="empty_documentation"
                    ariaLabel={`create {target}`}>Documentation</Button>
                {#if $canWriteCollections}
                    <CreateAttributeDropdown
                        bind:showCreateDropdown
                        bind:showCreate={showCreateAttribute}
                        bind:selectedOption={selectedAttribute}>
                        <Button
                            secondary
                            event="create_attribute"
                            on:click={() => {
                                showCreateDropdown = !showCreateDropdown;
                            }}>
                            Create attribute
                        </Button>
                    </CreateAttributeDropdown>
                {/if}
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreateIndex />

{#if selectedIndex}
    <Delete bind:showDelete {selectedIndex} />
    <Overview bind:showOverview {selectedIndex} />
{/if}

<CreateAttribute bind:showCreate={showCreateAttribute} bind:selectedOption={selectedAttribute} />

<FailedModal bind:show={showFailed} title="Create index" header="Creation failed" {error} />
