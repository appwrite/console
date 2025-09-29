<script lang="ts">
    import { Container } from '$lib/layout';
    import Delete from './delete.svelte';
    import { Button } from '$lib/elements/forms';
    import Overview from './overview.svelte';
    import CreateIndex from './create.svelte';
    import FailedModal from '../failedModal.svelte';
    import type { Models } from '@appwrite.io/console';
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
    import { type ComponentProps, onDestroy, type Snippet } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { type Entity, EntityContainer } from '$database/(entity)';
    import { SpreadsheetContainer, SideSheet } from '$database/(entity)/views/(layouts)';
    import type { CreateIndexesCallbackType } from '$database/(entity)/views/indexes/create.svelte';

    // TODO: change `column` to `entity`!

    let {
        entity,
        showCreateColumnSheet = $bindable(),
        onCreateIndex,
        onDeleteIndexes,
        emptyIndexesSheetView,
        emptyColumnsSheetView
    }: {
        entity: Entity;
        showCreateColumnSheet: boolean;
        onCreateIndex: (index: CreateIndexesCallbackType) => Promise<void>;
        onDeleteIndexes: (indexKeys: string[]) => Promise<void>;
        emptyIndexesSheetView: Snippet<[() => void]>;
        emptyColumnsSheetView?: Snippet<[() => void]>;
    } = $props();

    let showCreateIndex = $state(false);
    let selectedIndex: Models.ColumnIndex = $state(null);

    let createIndex: CreateIndex;
    let selectedIndexes = $state([]);

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

    onDestroy(() => (showCreateColumnSheet = false));

    const emptyCellsLimit = $derived($isSmallViewport ? 14 : 17);
    const emptyCellsCount = $derived(
        entity.indexes.length >= emptyCellsLimit ? 0 : emptyCellsLimit - entity.indexes.length
    );

    $effect(() => {
        console.log(`$effect > selectedIndexes`, $state.snapshot(selectedIndexes));
    });
</script>

<EntityContainer>
    {#snippet children(_, dependencies, terminology)}
        <Container
            expanded
            expandHeightButton={$isSmallViewport}
            style="background: var(--bgcolor-neutral-primary)">
            <Layout.Stack direction="row" justifyContent="flex-end">
                {#if $canWriteTables}
                    <Button
                        secondary
                        event="create_index"
                        disabled={!entity.columns?.length}
                        on:click={() => (showCreateIndex = true)}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Create index
                    </Button>
                {/if}
            </Layout.Stack>
        </Container>

        <div class="databases-spreadsheet">
            {#if entity.columns?.length}
                {#if entity.indexes.length}
                    <SpreadsheetContainer>
                        <Spreadsheet.Root
                            let:root
                            {columns}
                            height="100%"
                            allowSelection
                            emptyCells={emptyCellsCount}
                            bind:selectedRows={selectedIndexes}
                            bottomActionClick={() => (showCreateIndex = true)}>
                            <svelte:fragment slot="header" let:root>
                                <Spreadsheet.Header.Cell column="key" {root}
                                    >Key</Spreadsheet.Header.Cell>
                                <Spreadsheet.Header.Cell column="type" {root}
                                    >Type</Spreadsheet.Header.Cell>
                                <Spreadsheet.Header.Cell column="columns" {root}
                                    >Columns</Spreadsheet.Header.Cell>
                                <!--                        <Spreadsheet.Header.Cell column="orders" {root}-->
                                <!--                            >Orders</Spreadsheet.Header.Cell>-->
                                <Spreadsheet.Header.Cell column="lengths" {root}
                                    >Lengths</Spreadsheet.Header.Cell>
                                <Spreadsheet.Header.Cell column="actions" {root} />
                            </svelte:fragment>

                            {#each entity.indexes as index (index.key)}
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
                                        <Popover
                                            let:toggle
                                            padding="none"
                                            placement="bottom-end"
                                            portal>
                                            <Button
                                                text
                                                icon
                                                ariaLabel="more options"
                                                on:click={toggle}>
                                                <Icon icon={IconDotsHorizontal} size="s" />
                                            </Button>
                                            <ActionMenu.Root slot="tooltip" let:toggle>
                                                <ActionMenu.Item.Button
                                                    leadingIcon={IconEye}
                                                    on:click={() => {
                                                        toggle();
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
                                                        toggle();
                                                        showDelete = true;
                                                        selectedIndex = index;
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
                                    <Typography.Text
                                        variant="m-400"
                                        color="--fgcolor-neutral-secondary">
                                        {@const length = entity.indexes.length}
                                        {length}
                                        {length === 1 ? 'index' : 'indexes'}
                                    </Typography.Text>
                                </Layout.Stack>
                            </svelte:fragment>
                        </Spreadsheet.Root>
                    </SpreadsheetContainer>
                {:else}
                    {@render emptyIndexesSheetView(() => (showCreateIndex = true))}
                {/if}
            {:else}
                {@render emptyColumnsSheetView(() => (showCreateColumnSheet = true))}
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
            <CreateIndex
                {entity}
                {terminology}
                {dependencies}
                {onCreateIndex}
                {showCreateIndex}
                bind:this={createIndex} />
        </SideSheet>

        {#if selectedIndex}
            <Delete bind:showDelete {onDeleteIndexes} {dependencies} bind:selectedIndex />
        {:else if selectedIndexes && selectedIndexes.length}
            <Delete
                bind:showDelete
                {dependencies}
                {onDeleteIndexes}
                bind:selectedIndex={selectedIndexes} />
        {/if}

        <SideSheet title="Preview index" bind:show={showOverview}>
            <Overview {selectedIndex} {terminology} />
        </SideSheet>

        <FailedModal {error} bind:show={showFailed} title="Create index" header="Creation failed" />
    {/snippet}
</EntityContainer>

<style lang="scss">
    .floating-action-bar {
        left: 50%;
        width: 100%;
        z-index: 14;
        position: absolute;
        transform: translateX(-50%);
    }
</style>
