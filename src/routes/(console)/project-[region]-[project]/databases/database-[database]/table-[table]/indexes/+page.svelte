<script lang="ts">
    import { Container } from '$lib/layout';
    import { table } from '../store';
    import Delete from './deleteIndex.svelte';
    import CreateIndex from './createIndex.svelte';
    import Overview from './overviewIndex.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import FailedModal from '../failedModal.svelte';
    import { canWriteTables } from '$lib/stores/roles';
    import {
        ActionMenu,
        Badge,
        Divider,
        FloatingActionBar,
        Icon,
        Layout,
        Link,
        Popover,
        Spreadsheet,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconEye,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { type ComponentProps, onDestroy, onMount, tick } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import EmptySheet from '../layout/emptySheet.svelte';
    import SpreadsheetContainer from '../layout/spreadsheet.svelte';
    import { page } from '$app/state';
    import SideSheet from '../layout/sidesheet.svelte';
    import { flags } from '$lib/flags';
    import type { PageData } from './$types';
    import { showCreateAttributeSheet } from '../store';
    import { isSmallViewport } from '$lib/stores/viewport';

    let {
        data
    }: {
        data: PageData;
    } = $props();

    let showCreateIndex = $state(false);
    let selectedIndex: Models.ColumnIndex = $state(null);

    let selectedIndexes = $state([]);
    let createIndex: CreateIndex;
    let spreadsheetContainer: SpreadsheetContainer = $state(null);

    let error = $state('');
    let showFailed = $state(false);
    let showDelete = $state(false);
    let showOverview = $state(false);

    let columns = $state([
        { id: 'key' },
        { id: 'type' },
        { id: 'columns' },
        // { id: 'orders' }, // design doesn't have orders atm
        { id: 'lengths' },
        { id: 'actions', width: 40, isAction: true }
    ]);

    function getColumnStatusBadge(status: string): ComponentProps<Badge>['type'] {
        switch (status) {
            case 'processing':
                return 'warning';
            case 'deleting':
            case 'stuck':
            case 'failed':
                return 'error';
            default:
                return undefined;
        }
    }

    onDestroy(() => ($showCreateAttributeSheet.show = false));

    const emptyCellsLimit = $derived($isSmallViewport ? 14 : 17);
    const emptyCellsCount = $derived(
        data.table.indexes.length >= emptyCellsLimit
            ? 0
            : emptyCellsLimit - data.table.indexes.length
    );

    $effect(() => {
        if (data.table.indexes) {
            /* up-to-date height */
            tick().then(() => spreadsheetContainer?.resizeSheet());
        }
    });
</script>

<div class="databases-spreadsheet">
    {#if data.table?.columns?.length}
        {#if data.table.indexes.length}
            <SpreadsheetContainer bind:this={spreadsheetContainer}>
                <Spreadsheet.Root
                    let:root
                    {columns}
                    height="100%"
                    allowSelection
                    emptyCells={emptyCellsCount}
                    bind:selectedRows={selectedIndexes}
                    bottomActionClick={() => (showCreateIndex = true)}>
                    <svelte:fragment slot="header" let:root>
                        <Spreadsheet.Header.Cell column="key" {root}>Key</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="type" {root}>Type</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="columns" {root}
                            >Columns</Spreadsheet.Header.Cell>
                        <!--                        <Spreadsheet.Header.Cell column="orders" {root}-->
                        <!--                            >Orders</Spreadsheet.Header.Cell>-->
                        <Spreadsheet.Header.Cell column="lengths" {root}
                            >Lengths</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="actions" {root} />
                    </svelte:fragment>

                    {#each data.table.indexes as index}
                        <Spreadsheet.Row.Base {root} id={index.key}>
                            <Spreadsheet.Cell column="key" {root} isEditable={false}>
                                <Layout.Stack direction="row" alignItems="center">
                                    {index.key}
                                    {#if index.status !== 'available'}
                                        <Badge
                                            size="s"
                                            variant="secondary"
                                            content={index.status}
                                            type={getColumnStatusBadge(index.status)} />
                                        {#if index.error}
                                            <Link.Button
                                                variant="muted"
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    error = index.error;
                                                    showFailed = true;
                                                }}>Details</Link.Button>
                                        {/if}
                                    {/if}
                                </Layout.Stack>
                            </Spreadsheet.Cell>
                            <Spreadsheet.Cell column="type" {root} isEditable={false}
                                >{index.type}</Spreadsheet.Cell>
                            <Spreadsheet.Cell column="columns" {root} isEditable={false}>
                                {index.columns.join(', ')}
                            </Spreadsheet.Cell>
                            <!--                            <Spreadsheet.Cell column="orders" {root} isEditable={false}>-->
                            <!--                                {index.orders}-->
                            <!--                            </Spreadsheet.Cell>-->
                            <Spreadsheet.Cell column="lengths" {root} isEditable={false}>
                                {index.lengths}
                            </Spreadsheet.Cell>
                            <Spreadsheet.Cell column="actions" {root}>
                                <Popover let:toggle padding="none" placement="bottom-end" portal>
                                    <Button text icon ariaLabel="more options" on:click={toggle}>
                                        <Icon icon={IconDotsHorizontal} size="s" />
                                    </Button>
                                    <ActionMenu.Root slot="tooltip">
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconEye}
                                            on:click={() => {
                                                selectedIndex = index;
                                                showOverview = true;
                                            }}>Overview</ActionMenu.Item.Button>

                                        <div style:padding-block="0.25rem">
                                            <Divider />
                                        </div>

                                        <ActionMenu.Item.Button
                                            status="danger"
                                            leadingIcon={IconTrash}
                                            on:click={() => {
                                                selectedIndex = index;
                                                showDelete = true;
                                                trackEvent(Click.DatabaseIndexDelete);
                                            }}>Delete</ActionMenu.Item.Button>
                                    </ActionMenu.Root>
                                </Popover>
                            </Spreadsheet.Cell>
                        </Spreadsheet.Row.Base>
                    {/each}

                    <svelte:fragment slot="footer">
                        <Layout.Stack
                            direction="row"
                            alignContent="center"
                            alignItems="center"
                            justifyContent="space-between">
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                                {@const length = data.table.indexes.length}
                                {length}
                                {length === 1 ? 'index' : 'indexes'}
                            </Typography.Text>
                        </Layout.Stack>
                    </svelte:fragment>
                </Spreadsheet.Root>
            </SpreadsheetContainer>
        {:else}
            <EmptySheet
                mode="indexes"
                actions={{
                    primary: {
                        onClick: () => (showCreateIndex = true),
                        disabled: !$table?.columns?.length
                    }
                }} />
        {/if}
    {:else}
        <EmptySheet
            mode="indexes"
            title="You have no columns yet"
            actions={{
                primary: {
                    text: 'Create columns',
                    onClick: async () => {
                        $showCreateAttributeSheet.show = true;
                    }
                }
            }} />
    {/if}

    {#if selectedIndexes.length > 0}
        <div class="floating-action-bar">
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <div style:width="max-content">
                        <Layout.Stack direction="row" alignItems="center" gap="m">
                            <Badge content={selectedIndexes.length.toString()} />
                            <span style:font-size="14px">
                                {selectedIndexes.length > 1 ? 'indexes' : 'index'}
                                selected
                            </span>
                        </Layout.Stack>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <Button text on:click={() => (selectedIndexes = [])}>Cancel</Button>
                    <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {/if}
</div>

<SideSheet
    title="Create index"
    bind:show={showCreateIndex}
    submit={{
        text: 'Create',
        onClick: async () => await createIndex.create()
    }}>
    <CreateIndex {showCreateIndex} bind:this={createIndex} />
</SideSheet>

{#if selectedIndex}
    <Delete bind:showDelete {selectedIndex} />
{:else if selectedIndexes && selectedIndexes.length}
    <Delete bind:showDelete bind:selectedIndex={selectedIndexes} />
{/if}

<SideSheet title="Preview index" bind:show={showOverview}>
    <Overview {selectedIndex} />
</SideSheet>

<FailedModal bind:show={showFailed} title="Create index" header="Creation failed" {error} />

<style lang="scss">
    .floating-action-bar {
        left: 50%;
        width: 100%;
        z-index: 14;
        position: absolute;
        transform: translateX(-50%);
    }
</style>
