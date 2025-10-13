<script lang="ts">
    import { Container } from '$lib/layout';
    import Delete from './delete.svelte';
    import { Button } from '$lib/elements/forms';
    import Overview from './overview.svelte';
    import CreateIndex from './create.svelte';
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
    import { type ComponentProps, onMount, type Snippet } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        type Entity,
        type CreateIndexesCallbackType,
        SpreadsheetContainer,
        SideSheet,
        type Index
    } from '$database/(entity)';
    import { preferences } from '$lib/stores/preferences';
    import { debounce } from '$lib/helpers/debounce';
    import { page } from '$app/state';
    import type { ColumnsWidth } from '$database/table-[table]/store';

    let {
        entity,
        onCreateIndex,
        onDeleteIndexes,
        emptyIndexesSheetView,
        emptyEntitiesSheetView
    }: {
        entity: Entity;
        onCreateIndex: (index: CreateIndexesCallbackType) => Promise<void>;
        onDeleteIndexes: (indexKeys: string[]) => Promise<void>;
        emptyIndexesSheetView: Snippet<[() => void]>;
        emptyEntitiesSheetView?: Snippet<[() => void]>;
    } = $props();

    let showCreateIndex = $state(false);
    let selectedIndex: Index | null = $state(null);

    let createIndex: CreateIndex;
    let selectedIndexes = $state([]);

    let error = $state('');
    let showFailed = $state(false);
    let showDelete = $state(false);
    let showOverview = $state(false);

    let columnsWidth: ColumnsWidth | null = $state(null);

    const organizationId = $derived(page.data.organization?.$id ?? page.data.project?.teamId);

    const spreadsheetColumns = $derived([
        {
            id: 'key',
            width: getColumnWidth('key', $isSmallViewport ? 250 : 200),
            minimumWidth: $isSmallViewport ? 250 : 200,
            resizable: true
        },
        {
            id: 'type',
            width: getColumnWidth('type', 120),
            minimumWidth: 120,
            resizable: true
        },
        {
            id: 'columns',
            width: getColumnWidth('columns', 200),
            minimumWidth: 200,
            resizable: true
        },
        // { id: 'orders' }, // design doesn't have orders atm
        {
            id: 'lengths',
            width: getColumnWidth('lengths', 180),
            minimumWidth: 180,
            resizable: true
        },
        {
            id: 'actions',
            width: 40,
            isAction: true,
            resizable: false
        }
    ]);

    const emptyCellsLimit = $derived($isSmallViewport ? 14 : 17);
    const emptyCellsCount = $derived(
        entity.indexes.length >= emptyCellsLimit ? 0 : emptyCellsLimit - entity.indexes.length
    );

    onMount(() => {
        columnsWidth = preferences.getColumnWidths(entity.$id + '#indexes');
    });

    function getEntityStatusBadge(status: string): ComponentProps<Badge>['type'] {
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

    function getColumnWidth(columnId: string, defaultWidth: number): number {
        const savedWidth = columnsWidth?.[columnId];
        if (!savedWidth) return defaultWidth;

        return savedWidth.resized;
    }

    function saveColumnsWidth({ columnId, newWidth }: { columnId: string; newWidth: number }) {
        const existing = columnsWidth?.[columnId];
        const fixed = existing
            ? typeof existing?.fixed === 'number'
                ? existing.fixed
                : existing?.fixed?.min
            : newWidth;

        columnsWidth = {
            ...(columnsWidth ?? {}),
            [columnId]: {
                fixed,
                resized: Math.ceil(newWidth)
            }
        };

        saveColumnWidthsToPreferences({ columnId, newWidth, fixedWidth: fixed });
    }

    const saveColumnWidthsToPreferences = debounce(
        (column: { columnId: string; newWidth: number; fixedWidth: number }) => {
            if (!organizationId) return;

            preferences.saveColumnWidths(organizationId, entity.$id + '#indexes', {
                [column.columnId]: {
                    fixed: column.fixedWidth,
                    resized: Math.ceil(column.newWidth)
                }
            });
        },
        1000
    );
</script>

<Container
    expanded
    expandHeightButton={$isSmallViewport}
    style="background: var(--bgcolor-neutral-primary)">
    <Layout.Stack direction="row" justifyContent="flex-end">
        {#if $canWriteTables}
            <Button
                secondary
                event="create_index"
                disabled={!entity.fields?.length}
                on:click={() => (showCreateIndex = true)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Create index
            </Button>
        {/if}
    </Layout.Stack>
</Container>

<div class="databases-spreadsheet">
    {#if entity.fields?.length}
        {#if entity.indexes.length}
            <SpreadsheetContainer>
                <Spreadsheet.Root
                    let:root
                    height="100%"
                    allowSelection
                    columns={spreadsheetColumns}
                    emptyCells={emptyCellsCount}
                    bind:selectedRows={selectedIndexes}
                    bottomActionClick={() => (showCreateIndex = true)}
                    on:columnsResize={(resize) => saveColumnsWidth(resize.detail)}>
                    <svelte:fragment slot="header" let:root>
                        <Spreadsheet.Header.Cell column="key" {root}>Key</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="type" {root}>Type</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="columns" {root}
                            >Columns</Spreadsheet.Header.Cell>
                        <!--<Spreadsheet.Header.Cell column="orders" {root}
                            >Orders</Spreadsheet.Header.Cell>-->
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
                                            type={getEntityStatusBadge(index.status)} />
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
                                {index.fields.join(', ')}
                            </Spreadsheet.Cell>
                            <!--<Spreadsheet.Cell column="orders" {root} isEditable={false}>
                                {index.orders}
                            </Spreadsheet.Cell>-->
                            <Spreadsheet.Cell column="lengths" {root} isEditable={false}>
                                {index.lengths}
                            </Spreadsheet.Cell>
                            <Spreadsheet.Cell column="actions" {root}>
                                <Popover let:toggle padding="none" placement="bottom-end" portal>
                                    <Button text icon ariaLabel="more options" on:click={toggle}>
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
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
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
        {@render emptyEntitiesSheetView?.(() => (showCreateIndex = true))}
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
    <CreateIndex {entity} {onCreateIndex} {showCreateIndex} bind:this={createIndex} />
</SideSheet>

{#if selectedIndex}
    <Delete bind:showDelete {onDeleteIndexes} bind:selectedIndex />
{:else if selectedIndexes && selectedIndexes.length}
    <Delete bind:showDelete {onDeleteIndexes} bind:selectedIndex={selectedIndexes} />
{/if}

<SideSheet title="Preview index" bind:show={showOverview}>
    <Overview {selectedIndex} />
</SideSheet>

<FailedModal {error} bind:show={showFailed} title="Create index" header="Creation failed" />

<style lang="scss">
    .floating-action-bar {
        left: 50%;
        width: 100%;
        z-index: 14;
        position: absolute;
        transform: translateX(-50%);
    }
</style>
