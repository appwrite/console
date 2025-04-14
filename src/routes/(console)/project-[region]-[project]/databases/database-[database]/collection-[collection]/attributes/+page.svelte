<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { DropList, DropListItem, Empty, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { canWriteCollections } from '$lib/stores/roles';
    import Create from '../createAttribute.svelte';
    import { isRelationship } from '../document-[document]/attributes/store';
    import FailedModal from '../failedModal.svelte';
    import CreateIndex from '../indexes/createIndex.svelte';
    import { attributes, type Attributes } from '../store';
    import CreateAttributeDropdown from './createAttributeDropdown.svelte';
    import Delete from './deleteAttribute.svelte';
    import Edit from './edit.svelte';
    import { attributeOptions, type Option } from './store';

    const projectId = $page.params.project;
    const databaseId = $page.params.database;

    let showCreateDropdown = false;
    let showEmptyCreateDropdown = false;
    let showDropdown = [];
    let selectedOption: Option['name'] = null;
    let selectedAttribute: Attributes = null;
    let showCreate = false;
    let showDelete = false;
    let showEdit = false;
    let showCreateIndex = false;
    let showFailed = false;
    let error = '';

    enum attributeFormatIcon {
        ip = 'location-marker',
        url = 'link',
        email = 'mail',
        enum = 'view-list'
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Attributes</Heading>

        {#if $canWriteCollections}
            <CreateAttributeDropdown bind:showCreateDropdown bind:selectedOption bind:showCreate />
        {/if}
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
                    {@const option = attributeOptions.find(
                        (option) => option.type === attribute.type
                    )}
                    <TableRow>
                        <TableCell title="Key">
                            <div class="u-flex u-main-space-between u-cross-center">
                                <div class="u-flex u-cross-center u-gap-16">
                                    <div class="avatar is-size-small u-color-text-gray">
                                        {#if isRelationship(attribute)}
                                            <span
                                                class={`icon-${
                                                    attribute?.twoWay
                                                        ? 'switch-horizontal'
                                                        : 'arrow-sm-right'
                                                }`}
                                                aria-hidden="true" />
                                        {:else if 'format' in attribute && attribute.format}
                                            {@const icon = attributeFormatIcon[attribute?.format]}
                                            <span class={`icon-${icon}`} aria-hidden="true" />
                                        {:else}
                                            <span
                                                class={`icon-${option.icon}`}
                                                aria-hidden="true" />
                                        {/if}
                                    </div>
                                    <span class="text u-trim-1" data-private>{attribute.key}</span>
                                </div>
                                {#if attribute.status !== 'available'}
                                    <div class="u-inline-flex u-gap-12 u-cross-center">
                                        <Pill
                                            warning={attribute.status === 'processing'}
                                            danger={['deleting', 'stuck', 'failed'].includes(
                                                attribute.status
                                            )}>
                                            {attribute.status}
                                        </Pill>
                                        {#if attribute.error}
                                            <Button
                                                link
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    error = attribute.error;
                                                    showFailed = true;
                                                }}>Details</Button>
                                        {/if}
                                    </div>
                                {:else if attribute.required}
                                    <Pill>Required</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText onlyDesktop title="Type">
                            {#if 'format' in attribute && attribute.format}
                                <span class="u-capitalize">{attribute.format}</span>
                            {:else}
                                <span class="u-capitalize">{attribute.type}</span>
                                {#if isRelationship(attribute)}
                                    <span>
                                        with <a
                                            href={`${base}/project-${$page.params.region}-${projectId}/databases/database-${databaseId}/collection-${attribute?.relatedCollection}`}
                                            ><b data-private>{attribute?.key}</b></a>
                                    </span>
                                {/if}
                            {/if}
                            <span>
                                {attribute.array ? '[]' : ''}
                            </span>
                        </TableCellText>
                        <TableCellText onlyDesktop title="Default Value">
                            {attribute?.default !== null && attribute?.default !== undefined
                                ? attribute?.default
                                : '-'}
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
                                        event="edit_attribute"
                                        icon="pencil"
                                        on:click={() => {
                                            selectedAttribute = attribute;
                                            showEdit = true;
                                            showDropdown[index] = false;
                                        }}>
                                        Update
                                    </DropListItem>
                                    {#if !isRelationship(attribute)}
                                        <DropListItem
                                            icon="plus"
                                            on:click={() => {
                                                selectedAttribute = attribute;
                                                showCreateIndex = true;
                                                showDropdown[index] = false;
                                            }}>
                                            Create Index
                                        </DropListItem>
                                    {/if}
                                    {#if attribute.status !== 'processing'}
                                        <DropListItem
                                            icon="trash"
                                            on:click={() => {
                                                selectedAttribute = attribute;
                                                showDelete = true;
                                                showDropdown[index] = false;
                                            }}>
                                            Delete
                                        </DropListItem>
                                    {/if}
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
            allowCreate={$canWriteCollections}
            single
            target="attribute"
            on:click={() => (showEmptyCreateDropdown = true)}>
            <div class="u-text-center">
                <Heading size="7" tag="h2">Create your first attribute to get started.</Heading>
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
                        bind:showCreateDropdown={showEmptyCreateDropdown}
                        bind:selectedOption
                        bind:showCreate>
                        <Button
                            secondary
                            event="create_attribute"
                            on:click={() => {
                                showEmptyCreateDropdown = !showEmptyCreateDropdown;
                            }}>
                            Create attribute
                        </Button>
                    </CreateAttributeDropdown>
                {/if}
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate bind:selectedOption />
<Delete bind:showDelete {selectedAttribute} />
<Edit bind:showEdit {selectedAttribute} />
<CreateIndex bind:showCreateIndex externalAttribute={selectedAttribute} />
<FailedModal bind:show={showFailed} title="Create attribute" header="Creation failed" {error} />
