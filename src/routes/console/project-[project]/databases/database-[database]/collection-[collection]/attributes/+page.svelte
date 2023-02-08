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
    import { DropList, DropListItem, Empty, Heading } from '$lib/components';
    import { attributes, type Attributes } from '../store';
    import { Container } from '$lib/layout';
    import { Pill } from '$lib/elements';
    import Create from '../createAttribute.svelte';
    import CreateIndex from '../indexes/createIndex.svelte';
    import Delete from './deleteAttribute.svelte';
    import Overview from './overview.svelte';

    let showDropdown = [];
    let selectedAttribute: Attributes = null;
    let showCreate = false;
    let showDelete = false;
    let showOverview = false;
    let showCreateIndex = false;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Attributes</Heading>

        <Button on:click={() => (showCreate = true)} event="create_attribute">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create attribute</span>
        </Button>
    </div>

    {#if $attributes.length}
        <Table>
            <TableHeader>
                <TableCellHead>Key</TableCellHead>
                <TableCellHead onlyDesktop>Type</TableCellHead>
                <TableCellHead onlyDesktop>Default Value</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $attributes as attribute, index}
                    <TableRow>
                        <TableCell title="Key">
                            <div class="u-flex u-main-space-between">
                                <span class="text u-trim">{attribute.key}</span>
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
                        <TableCellText onlyDesktop title="Type">
                            {`${attribute.type}${attribute.array ? '[]' : ''}`}
                        </TableCellText>
                        <TableCellText onlyDesktop title="Default Value">
                            {attribute.default !== null ? attribute.default : '-'}
                        </TableCellText>
                        <TableCell showOverflow>
                            <DropList
                                bind:show={showDropdown[index]}
                                placement="bottom-start"
                                noArrow>
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
                                        on:click={() => {
                                            selectedAttribute = attribute;
                                            showOverview = true;
                                            showDropdown[index] = false;
                                        }}>Overview</DropListItem>
                                    <DropListItem
                                        icon="plus"
                                        on:click={() => {
                                            selectedAttribute = attribute;
                                            showCreateIndex = true;
                                            showDropdown[index] = false;
                                        }}>Create Index</DropListItem>
                                    <DropListItem
                                        icon="trash"
                                        on:click={() => {
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
            <p class="text">Total results: {$attributes.length}</p>
        </div>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/databases#attributes"
            target="attribute"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate />
<Delete bind:showDelete {selectedAttribute} />
<Overview bind:showOverview {selectedAttribute} />
<CreateIndex bind:showCreateIndex externalAttribute={selectedAttribute} />
