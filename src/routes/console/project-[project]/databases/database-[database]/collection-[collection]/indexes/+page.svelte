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
    import LL from '$i18n/i18n-svelte';

    let showDropdown = [];
    let selectedIndex: Models.Index = null;
    let showCreateIndex = false;
    let showOverview = false;
    let showDelete = false;
    let showCreateAttribute = false;
    let showCreateDropdown = false;
    let selectedAttribute: string = null;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">{$LL.console.project.title.indexes()}</Heading>

        <Button
            event="create_index"
            disabled={!$collection?.attributes?.length}
            on:click={() => (showCreateIndex = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">{$LL.console.project.button.createIndex()}</span>
        </Button>
    </div>
    {#if $collection?.attributes?.length}
        {#if $indexes.length}
            <Table>
                <TableHeader>
                    <TableCellHead>{$LL.console.project.table.header.key()}</TableCellHead>
                    <TableCellHead onlyDesktop
                        >{$LL.console.project.table.header.type()}</TableCellHead>
                    <TableCellHead onlyDesktop
                        >{$LL.console.project.table.header.attributes()}</TableCellHead>
                    <TableCellHead onlyDesktop
                        >{$LL.console.project.table.header.asc_dsc()}</TableCellHead>
                    <TableCellHead width={30} />
                </TableHeader>
                <TableBody>
                    {#each $indexes as index, i}
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
                                            }}
                                            >{$LL.console.project.button.dropdown.overview()}</DropListItem>

                                        <DropListItem
                                            icon="trash"
                                            on:click={() => {
                                                selectedIndex = index;
                                                showDelete = true;
                                            }}
                                            >{$LL.console.project.button.submit.delete()}</DropListItem>
                                    </svelte:fragment>
                                </DropList>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
            <div class="u-flex u-margin-block-start-32 u-main-space-between">
                <p class="text">
                    {$LL.console.project.texts.databaes.totalResult()}{' '}{$indexes.length}
                </p>
            </div>
        {:else}
            <Empty
                single
                href="https://appwrite.io/docs/databases#indexes"
                target="index"
                on:click={() => (showCreateIndex = true)} />
        {/if}
    {:else}
        <Empty single target="attribute" on:click={() => (showCreateDropdown = true)}>
            <div class="u-text-center">
                <Heading size="7" tag="h2"
                    >{$LL.console.project.texts.databaes.createAttribute.heading()}</Heading>
                <p class="body-text-2 u-bold u-margin-block-start-4">
                    {$LL.console.project.texts.databaes.createAttribute.note()}
                </p>
            </div>
            <div class="u-flex u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/databases#attributes"
                    text
                    event="empty_documentation"
                    ariaLabel={`create {target}`}
                    >{$LL.console.project.button.documentation()}</Button>
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
                        {$LL.console.project.button.createAttribute()}
                    </Button>
                </CreateAttributeDropdown>
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
