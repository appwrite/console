<script lang="ts">
    import { Container } from '$lib/layout';
    import { collection } from '../store';
    import Delete from './deleteIndex.svelte';
    import CreateIndex from './createIndex.svelte';
    import Overview from './overviewIndex.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import FailedModal from '../failedModal.svelte';
    import { canWriteCollections } from '$lib/stores/roles';
    import {
        ActionMenu,
        Badge,
        FloatingActionBar,
        Icon,
        Layout,
        Link,
        Popover,
        Spreadsheet
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconEye,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { type ComponentProps, onMount } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import EmptySheet from '../layout/emptySheet.svelte';
    import SpreadsheetContainer from '../layout/spreadsheet.svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import SideSheet from '../layout/sidesheet.svelte';
    import { flags } from '$lib/flags';
    import type { PageData } from './$types';

    let {
        data
    }: {
        data: PageData;
    } = $props();

    let showCreateIndex = $state(false);
    let selectedIndex: Models.Index = $state(null);

    let selectedIndexes = $state([]);
    let createIndex: CreateIndex;

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

    function getAttributeStatusBadge(status: string): ComponentProps<Badge>['type'] {
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

    const showLengths = flags.showIndexLengths(page.data);

    onMount(() => {
        if (!showLengths) {
            columns = columns.filter((col) => col.id !== 'lengths');
        }
    });
</script>

<Container expanded style="background: var(--bgcolor-neutral-primary)">
    <Layout.Stack direction="row" justifyContent="flex-end">
        {#if $canWriteCollections}
            <Button
                secondary
                event="create_index"
                disabled={!$collection?.attributes?.length}
                on:click={() => (showCreateIndex = true)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Create index
            </Button>
        {/if}
    </Layout.Stack>
</Container>

<div class="databases-spreadsheet">
    {#if data.collection?.attributes?.length}
        {#if data.collection.indexes.length}
            <SpreadsheetContainer>
                <Spreadsheet.Root
                    let:root
                    {columns}
                    allowSelection
                    bind:selectedRows={selectedIndexes}>
                    <svelte:fragment slot="header" let:root>
                        <Spreadsheet.Header.Cell column="key" {root}>Key</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="type" {root}>Type</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="columns" {root}
                            >Columns</Spreadsheet.Header.Cell>
                        <!--                        <Spreadsheet.Header.Cell column="orders" {root}-->
                        <!--                            >Orders</Spreadsheet.Header.Cell>-->
                        {#if showLengths}
                            <Spreadsheet.Header.Cell column="lengths" {root}
                                >Lengths</Spreadsheet.Header.Cell>
                        {/if}
                        <Spreadsheet.Header.Cell column="actions" {root} />
                    </svelte:fragment>
                    {#each data.collection.indexes as index}
                        <Spreadsheet.Row.Base {root} id={index.key}>
                            <Spreadsheet.Cell column="key" {root} isEditable={false}>
                                <Layout.Stack direction="row" alignItems="center">
                                    {index.key}
                                    {#if index.status !== 'available'}
                                        <Badge
                                            size="s"
                                            variant="secondary"
                                            content={index.status}
                                            type={getAttributeStatusBadge(index.status)} />
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
                                {index.attributes.join(', ')}
                            </Spreadsheet.Cell>
                            <!--                            <Spreadsheet.Cell column="orders" {root} isEditable={false}>-->
                            <!--                                {index.orders}-->
                            <!--                            </Spreadsheet.Cell>-->
                            {#if showLengths}
                                <Spreadsheet.Cell column="lengths" {root} isEditable={false}>
                                    {index.lengths}
                                </Spreadsheet.Cell>
                            {/if}
                            <Spreadsheet.Cell column="actions" {root}>
                                <Popover let:toggle padding="none" placement="bottom-end">
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
                </Spreadsheet.Root>
            </SpreadsheetContainer>
        {:else}
            <EmptySheet
                mode="indexes"
                actions={{
                    primary: {
                        onClick: () => (showCreateIndex = true),
                        disabled: !$collection?.attributes?.length
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
                        await goto(
                            `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/collection-${page.params.collection}/attributes`
                        );
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
