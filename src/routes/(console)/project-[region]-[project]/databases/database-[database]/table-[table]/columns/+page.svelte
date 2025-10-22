<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import {
        ActionMenu,
        Badge,
        Divider,
        FloatingActionBar,
        Icon,
        Layout,
        Link,
        Popover,
        Selector,
        Spreadsheet,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { isRelationship, isSpatialType, isString } from '../rows/store';
    import FailedModal from '../failedModal.svelte';
    import {
        columns,
        type Columns,
        type ColumnsWidth,
        indexes,
        isCsvImportInProgress,
        reorderItems,
        showCreateIndexSheet
    } from '../store';
    import EditColumn from './edit.svelte';
    import DeleteColumn from './deleteColumn.svelte';
    import { columnOptions } from './store';
    import {
        IconArrowSmRight,
        IconDotsHorizontal,
        IconLink,
        IconLocationMarker,
        IconPencil,
        IconPlus,
        IconSwitchHorizontal,
        IconTrash,
        IconViewList,
        IconLockClosed,
        IconFingerPrint,
        IconMail
    } from '@appwrite.io/pink-icons-svelte';
    import { type ComponentProps, onDestroy, onMount } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import CsvDisabled from '../csvDisabled.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import SideSheet from '../layout/sidesheet.svelte';
    import SpreadsheetContainer from '../layout/spreadsheet.svelte';
    import { showCreateColumnSheet } from '../store';
    import { type Models } from '@appwrite.io/console';
    import { preferences } from '$lib/stores/preferences';
    import { page } from '$app/state';
    import { debounce } from '$lib/helpers/debounce';
    import type { PageData } from './$types';

    const {
        data
    }: {
        data: PageData;
    } = $props();

    const updatedColumnsForSheet = $derived.by(() => {
        const baseAttrs = [
            {
                key: '$id',
                type: 'string',
                required: true,
                name: '$id',
                selectable: false,
                system: true
            } as Models.ColumnString & {
                name: string;
                selectable: boolean;
                system: boolean;
            },
            ...$columns,
            {
                key: '$createdAt',
                type: 'datetime',
                required: true,
                name: '$createdAt',
                selectable: false,
                system: true
            } as Models.ColumnDatetime & {
                name: string;
                selectable: boolean;
                system: boolean;
            },
            {
                key: '$updatedAt',
                type: 'datetime',
                required: true,
                name: '$updatedAt',
                selectable: false,
                system: true
            } as Models.ColumnDatetime & {
                name: string;
                selectable: boolean;
                system: boolean;
            }
        ];

        return reorderItems(baseAttrs, columnsOrder);
    });

    let error = $state('');
    let showDropdown = $state([]);
    let showFailed = $state(false);
    let showDelete = $state(false);
    let selectedColumns = $state([]);
    let selectedColumn: Columns = $state(null);
    let columnIndexMap: Record<string, boolean> = $state({});

    let columnsOrder = $state<string[]>([]);
    let columnsWidth = $state<ColumnsWidth | null>(null);

    const tableId = page.params.table;
    const organizationId = data.organization.$id ?? data.project.teamId;

    let showEdit = $state(false);
    let editColumn: EditColumn;

    const columnFormatIcon = {
        ip: IconLocationMarker,
        url: IconLink,
        email: IconMail,
        enum: IconViewList
    };

    const emptyCellsLimit = $derived($isSmallViewport ? 14 : 17);
    const emptyCellsCount = $derived(
        updatedColumnsForSheet.length >= emptyCellsLimit
            ? 0
            : emptyCellsLimit - updatedColumnsForSheet.length
    );

    onMount(() => {
        columnsOrder = preferences.getColumnOrder(tableId);
        columnsWidth = preferences.getColumnWidths(tableId + '#columns');
    });

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

    function getMinMaxSizeForColumn(column: Columns): string | undefined {
        if (column.type === 'string' && !column['format'] && column.key !== '$id') {
            const stringColumn = column as Models.ColumnString;
            return `Size: ${stringColumn.size}`;
        } else if (column.type === 'integer' || column.type === 'double') {
            const numbersColumn = column as Models.ColumnInteger | Models.ColumnFloat;
            const { min, max } = numbersColumn;

            const hasValidMin = min > Number.MIN_SAFE_INTEGER;
            const hasValidMax = max < Number.MAX_SAFE_INTEGER;

            if (hasValidMin && hasValidMax) {
                return `Min: ${min}, Max: ${max}`;
            } else if (hasValidMin) {
                return `Min: ${min}`;
            } else if (hasValidMax) {
                return `Max: ${max}`;
            }
        } else {
            return undefined;
        }
    }

    function getRelationshipTypeForColumn(column: Columns): string | null {
        if (!isRelationship(column)) {
            return null;
        }

        const relationshipMap = {
            oneToOne: 'One to one',
            oneToMany: 'One to many',
            manyToOne: 'Many to one',
            manyToMany: 'Many to many'
        };

        const relationType = (column as Models.ColumnRelationship).relationType;
        const formattedType = relationshipMap[relationType] || relationType;

        return `Type: ${formattedType}`;
    }

    function isSystemColumnKey(column: Columns) {
        return column.key.startsWith('$');
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

            preferences.saveColumnWidths(organizationId, tableId + '#columns', {
                [column.columnId]: {
                    fixed: column.fixedWidth,
                    resized: Math.ceil(column.newWidth)
                }
            });
        },
        1000
    );

    onDestroy(() => ($showCreateColumnSheet.show = false));

    const spreadsheetColumns = $derived([
        {
            id: 'key',
            width: getColumnWidth('key', 300),
            minimumWidth: 300,
            resizable: true
        },
        {
            id: 'type',
            width: 150,
            minimumWidth: 150,
            resizable: false
        },
        {
            id: 'indexed',
            width: getColumnWidth('indexed', 150),
            minimumWidth: 150,
            resizable: true
        },
        {
            id: 'default',
            width: getColumnWidth('default', 200),
            minimumWidth: 200,
            resizable: true
        },
        { id: 'actions', width: 40, isAction: true, resizable: false }
    ]);

    $effect(() => {
        if (!$showCreateIndexSheet.show && $showCreateIndexSheet.column) {
            const columnKey = $showCreateIndexSheet.column;

            const isActuallyIndexed = $indexes.some((index) => index.columns.includes(columnKey));

            if (!isActuallyIndexed) {
                columnIndexMap[columnKey] = false;
            }
        }
    });
</script>

<Container
    expanded
    expandHeightButton={$isSmallViewport}
    style="background: var(--bgcolor-neutral-primary)">
    <Layout.Stack direction="row" justifyContent="flex-end">
        {#if updatedColumnsForSheet}
            <Button
                size="s"
                secondary
                disabled={$isCsvImportInProgress}
                on:click={() => ($showCreateColumnSheet.show = true)}
                event="create_attribute">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create column
            </Button>
        {/if}
    </Layout.Stack>
</Container>

<div class="databases-spreadsheet">
    <SpreadsheetContainer>
        <Spreadsheet.Root
            let:root
            allowSelection
            height="100%"
            emptyCells={emptyCellsCount}
            bind:selectedRows={selectedColumns}
            columns={spreadsheetColumns}
            bottomActionClick={() => ($showCreateColumnSheet.show = true)}
            on:columnsResize={(resize) => saveColumnsWidth(resize.detail)}>
            <svelte:fragment slot="header" let:root>
                <Spreadsheet.Header.Cell column="key" {root}>Column name</Spreadsheet.Header.Cell>
                <Spreadsheet.Header.Cell column="type" {root}>Type</Spreadsheet.Header.Cell>
                <Spreadsheet.Header.Cell column="indexed" {root}>Indexed</Spreadsheet.Header.Cell>
                <Spreadsheet.Header.Cell column="default" {root}
                    >Default value</Spreadsheet.Header.Cell>
                <Spreadsheet.Header.Cell column="actions" {root} />
            </svelte:fragment>

            {#each updatedColumnsForSheet as column, index (column.key)}
                {@const option = columnOptions.find((option) => option.type === column.type)}
                {@const isSelectable =
                    column['system'] || column.type === 'relationship' ? 'disabled' : true}
                <Spreadsheet.Row.Base {root} select={isSelectable} id={column.key}>
                    <Spreadsheet.Cell column="key" {root} isEditable={false}>
                        <Layout.Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            style="min-width:0">
                            <Layout.Stack
                                gap="s"
                                inline
                                direction="row"
                                alignItems="center"
                                style="min-width:0; flex:1 1 auto;">
                                {#if isRelationship(column)}
                                    <Icon
                                        size="s"
                                        icon={column?.twoWay
                                            ? IconSwitchHorizontal
                                            : IconArrowSmRight} />
                                {:else if 'format' in column && column.format}
                                    {@const icon = columnFormatIcon[column?.format]}
                                    <Icon {icon} size="s" />
                                {:else if column.key === '$id'}
                                    <Icon icon={IconFingerPrint} size="s" />
                                {:else}
                                    <Icon icon={option.icon} size="s" />
                                {/if}

                                <Layout.Stack
                                    gap="s"
                                    inline
                                    direction="row"
                                    alignItems="center"
                                    style="min-width:0; flex:1 1 auto; overflow:hidden;">
                                    <Typography.Text truncate>
                                        {#if isSystemColumnKey(column)}
                                            {column.key}
                                        {:else}
                                            {column.key}{column.array ? '[]' : undefined}
                                        {/if}
                                    </Typography.Text>

                                    {#if isString(column) && column.encrypt}
                                        <Tooltip>
                                            <Icon
                                                size="s"
                                                icon={IconLockClosed}
                                                color="--fgcolor-neutral-tertiary" />
                                            <div slot="tooltip">Encrypted</div>
                                        </Tooltip>
                                    {/if}

                                    {#if column.status !== 'available'}
                                        <Badge
                                            size="s"
                                            variant="secondary"
                                            content={column.status}
                                            type={getColumnStatusBadge(column.status)} />
                                        {#if column.error}
                                            <Link.Button
                                                variant="muted"
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    error = column.error;
                                                    showFailed = true;
                                                }}>Details</Link.Button>
                                        {/if}
                                    {:else if column.required}
                                        <Badge size="xs" variant="secondary" content="required" />
                                    {/if}
                                </Layout.Stack>
                            </Layout.Stack>
                            {@const minMaxSize = getMinMaxSizeForColumn(column)}
                            {@const relationType = getRelationshipTypeForColumn(column)}
                            {#if minMaxSize}
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    {minMaxSize}
                                </Typography.Caption>
                            {:else if relationType}
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    {relationType}
                                </Typography.Caption>
                            {/if}
                        </Layout.Stack>
                    </Spreadsheet.Cell>
                    <Spreadsheet.Cell column="type" {root} isEditable={false}>
                        {@const columnType = column['format'] ? column['format'] : column.type}
                        {columnType.toLowerCase()}
                    </Spreadsheet.Cell>
                    <Spreadsheet.Cell column="indexed" {root} isEditable={false}>
                        {@const isActuallyIndexed = $indexes.some((index) =>
                            index.columns.includes(column.key)
                        )}

                        {@const checked = isActuallyIndexed || !!columnIndexMap[column.key]}

                        <Selector.Checkbox
                            size="s"
                            {checked}
                            disabled={isActuallyIndexed}
                            on:change={(e) => {
                                if (!isActuallyIndexed) {
                                    if (e.detail) {
                                        columnIndexMap[column.key] = true;
                                        $showCreateIndexSheet.show = true;
                                        $showCreateIndexSheet.column = column.key;
                                    }
                                }
                            }} />
                    </Spreadsheet.Cell>
                    <Spreadsheet.Cell column="default" {root} isEditable={false}>
                        {@const _default = column.required
                            ? '-'
                            : column?.default !== null && column?.default !== undefined
                              ? column?.default
                              : null}

                        {#if _default === null}
                            <Badge variant="secondary" content="NULL" size="xs" />
                        {:else if isSpatialType(column)}
                            {JSON.stringify(_default)}
                        {:else}
                            {_default}
                        {/if}
                    </Spreadsheet.Cell>
                    <Spreadsheet.Cell column="actions" {root} isEditable={false}>
                        {#if $isCsvImportInProgress}
                            <CsvDisabled>
                                <Button disabled text icon ariaLabel="more options">
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                            </CsvDisabled>
                        {:else if column.key !== '$sequence'}
                            <!-- TODO: no portal, rather see if we can fix the cell -->
                            <Popover let:toggle padding="none" placement="bottom-end" portal>
                                <Button text icon ariaLabel="more options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip" let:toggle>
                                    {#if !column['system']}
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconPencil}
                                            on:click={(event) => {
                                                toggle(event);
                                                showEdit = true;
                                                selectedColumn = column;
                                                showDropdown[index] = false;
                                            }}>
                                            Update
                                        </ActionMenu.Item.Button>
                                    {/if}
                                    {#if !isRelationship(column)}
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconPlus}
                                            on:click={(event) => {
                                                toggle(event);
                                                showDropdown[index] = false;
                                                $showCreateIndexSheet.show = true;
                                                $showCreateIndexSheet.column = column.key;
                                            }}>
                                            Create index
                                        </ActionMenu.Item.Button>
                                    {/if}
                                    {#if column.status !== 'processing' && !column['system']}
                                        <div style:padding-block="0.25rem">
                                            <Divider />
                                        </div>

                                        <ActionMenu.Item.Button
                                            status="danger"
                                            leadingIcon={IconTrash}
                                            on:click={(event) => {
                                                toggle(event);
                                                showDelete = true;
                                                showDropdown[index] = false;
                                                selectedColumn = column;
                                                trackEvent(Click.DatabaseColumnDelete);
                                            }}>
                                            Delete
                                        </ActionMenu.Item.Button>
                                    {/if}
                                </ActionMenu.Root>
                            </Popover>
                        {/if}
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
                        <!-- there will always be 3 columns at the least -->
                        {updatedColumnsForSheet.length} columns
                    </Typography.Text>
                </Layout.Stack>
            </svelte:fragment>
        </Spreadsheet.Root>
    </SpreadsheetContainer>

    {#if selectedColumns.length > 0}
        <div class="floating-action-bar">
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <div style:width="max-content">
                        <Layout.Stack direction="row" alignItems="center" gap="m">
                            <Badge content={selectedColumns.length.toString()} />
                            <span style:font-size="14px">
                                {selectedColumns.length > 1 ? 'columns' : 'column'}
                                selected
                            </span>
                        </Layout.Stack>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <Button text on:click={() => (selectedColumns = [])}>Cancel</Button>
                    <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {/if}
</div>

{#if selectedColumn}
    <DeleteColumn bind:showDelete bind:selectedColumn />
{:else if selectedColumns && selectedColumns.length}
    <DeleteColumn bind:showDelete bind:selectedColumn={selectedColumns} />
{/if}

<SideSheet
    title="Edit column"
    bind:show={showEdit}
    submit={{
        text: 'Update',
        onClick: async () => await editColumn.submit()
    }}>
    <EditColumn showEdit isModal={false} {selectedColumn} bind:this={editColumn} />
</SideSheet>

{#if showFailed}
    <FailedModal bind:show={showFailed} title="Create attribute" header="Creation failed" {error} />
{/if}

<style>
    .floating-action-bar {
        left: 50%;
        width: 100%;
        z-index: 14;
        position: absolute;
        transform: translateX(-50%);
    }
</style>
