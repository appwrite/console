<script lang="ts">
    import { Filters, hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import type { Column, ColumnType } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { canWriteTables, canWriteRows } from '$lib/stores/roles';
    import { Icon, Layout, Divider, Tooltip } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import {
        tableColumns,
        isCsvImportInProgress,
        showRowCreateSheet,
        showCreateColumnSheet,
        randomDataModalState,
        columnsOrder
    } from './store';
    import SpreadSheet from './spreadsheet.svelte';
    import { writable } from 'svelte/store';
    import FilePicker from '$lib/components/filePicker.svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IconChevronDown, IconChevronUp, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import CreateRow from './rows/create.svelte';
    import { onDestroy } from 'svelte';
    import { isCloud } from '$lib/system';
    import { columnOptions } from './columns/store';
    import { EmptySheet, type Field } from '$database/(entity)';
    import { Empty as SuggestionsEmptySheet, tableColumnSuggestions } from '../(suggestions)';
    import { expandTabs } from '$database/store';

    export let data: PageData;

    $: table = data.table;

    let showImportCSV = false;

    // todo: might need a type fix here.
    const filterColumns = writable<Column[]>([]);

    function createTableColumns(fields: Field[], selected: string[] = []): Column[] {
        return fields.map((field) => {
            return {
                id: field.key,
                title: field.key,
                type: field.type as ColumnType,
                hide: !!selected?.includes(field.key),
                array: field?.array,
                format: 'format' in field && field?.format === 'enum' ? field.format : null,
                elements: 'elements' in field ? field.elements : null,
                icon: columnOptions.find((option) => option.type === field.type)?.icon
            };
        });
    }

    function createFilterableColumns(columns: Column[], selected: string[] = []): Column[] {
        const idColumn = [{ id: '$id', title: '$id', type: 'string' as ColumnType }].filter(
            (col) => !selected.includes(col.id)
        );

        const systemColumns = [
            { id: '$createdAt', title: '$createdAt', type: 'datetime' as ColumnType },
            { id: '$updatedAt', title: '$updatedAt', type: 'datetime' as ColumnType }
        ].filter((col) => !!selected.includes(col.id));

        return [...idColumn, ...columns.filter((column) => !column.isAction), ...systemColumns];
    }

    $: selected = preferences.getCustomTableColumns(page.params.table);

    $: if (table.fields) {
        const freshColumns = createTableColumns(table.fields, selected);
        tableColumns.set(freshColumns);
        filterColumns.set(createFilterableColumns(freshColumns, selected));
    }

    $: hasColumns = !!table.fields.length;
    $: hasValidColumns = table?.fields?.some((field: Field) => field.status === 'available');
    $: canShowSuggestionsSheet =
        // enabled, has table details
        // and it matches current table
        $tableColumnSuggestions.enabled &&
        $tableColumnSuggestions.table &&
        $tableColumnSuggestions.table.id === page.params.table;

    async function onSelect(file: Models.File, localFile = false) {
        $isCsvImportInProgress = true;

        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .migrations.createCsvMigration({
                    bucketId: file.bucketId,
                    fileId: file.$id,
                    resourceId: `${page.params.database}:${page.params.table}`,
                    internalFile: localFile
                });

            addNotification({
                type: 'success',
                message: 'Rows import from csv has started'
            });

            trackEvent(Submit.DatabaseImportCsv);
        } catch (e) {
            trackError(e, Submit.DatabaseImportCsv);
            addNotification({
                type: 'error',
                message: e.message
            });
        } finally {
            $isCsvImportInProgress = false;
        }
    }

    onDestroy(() => ($showCreateColumnSheet.show = false));
</script>

{#key page.params.table}
    <Container expanded expandHeightButton style="background: var(--bgcolor-neutral-primary)">
        <Layout.Stack direction="column" gap="xl">
            <Layout.Stack direction="row" justifyContent="space-between">
                <Layout.Stack direction="row" gap="s">
                    <Tooltip>
                        <div>
                            <ViewSelector
                                onlyIcon
                                ui="new"
                                view={data.view}
                                columns={tableColumns}
                                hideView
                                showAnyway
                                isCustomTable />
                        </div>

                        <svelte:fragment slot="tooltip">Columns</svelte:fragment>
                    </Tooltip>

                    <Tooltip>
                        <Filters
                            onlyIcon
                            query={data.query}
                            columns={filterColumns}
                            disabled={!(hasColumns && hasValidColumns)}
                            analyticsSource="database_tables" />

                        <svelte:fragment slot="tooltip">Filters</svelte:fragment>
                    </Tooltip>
                </Layout.Stack>
                <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <Button
                        secondary
                        event={Click.DatabaseImportCsv}
                        disabled={!(hasColumns && hasValidColumns)}
                        on:click={() => (showImportCSV = true)}>
                        Import CSV
                    </Button>
                    {#if !$isSmallViewport}
                        <Button
                            secondary
                            event="create_row"
                            disabled={!(hasColumns && hasValidColumns)}
                            on:click={() => ($showRowCreateSheet.show = true)}>
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Create row
                        </Button>

                        <Button
                            icon
                            size="s"
                            secondary
                            class="small-button-dimensions"
                            on:click={() => {
                                $expandTabs = !$expandTabs;
                                preferences.setKey('entityHeaderExpanded', $expandTabs);
                            }}>
                            <Icon icon={!$expandTabs ? IconChevronDown : IconChevronUp} size="s" />
                        </Button>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
            {#if $isSmallViewport}
                <Button
                    secondary
                    event="create_row"
                    disabled={!(hasColumns && hasValidColumns)}
                    on:click={() => ($showRowCreateSheet.show = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create row
                </Button>
            {/if}
        </Layout.Stack>
    </Container>

    <div class="databases-spreadsheet">
        {#if hasColumns && hasValidColumns}
            {#if data.rows.total}
                <Divider />
                <SpreadSheet {data} bind:showRowCreateSheet={$showRowCreateSheet} />
            {:else if $hasPageQueries}
                <EmptySheet
                    mode="rows-filtered"
                    title="There are no rows that match your filters"
                    customColumns={createTableColumns(table.fields, selected)}
                    actions={{
                        primary: {
                            text: 'Clear filters',
                            onClick: () => {
                                queries.clearAll();
                                queries.apply();
                                trackEvent(Submit.FilterClear, {
                                    source: 'database_tables'
                                });
                            }
                        }
                    }} />
            {:else}
                <EmptySheet
                    mode="rows"
                    customColumns={createTableColumns(table.fields, selected)}
                    showActions={$canWriteRows}
                    actions={{
                        primary: {
                            text: 'Create rows',
                            onClick: () => {
                                $showRowCreateSheet.show = true;
                            }
                        },
                        random: {
                            onClick: () => {
                                $randomDataModalState.show = true;
                            }
                        }
                    }} />
            {/if}
        {:else if isCloud && canShowSuggestionsSheet}
            <SuggestionsEmptySheet />
        {:else}
            <EmptySheet
                mode="rows"
                title="You have no columns yet"
                showActions={$canWriteTables}
                onOpenCreateColumn={() => {
                    $showCreateColumnSheet.show = true;
                    $showCreateColumnSheet.title = 'Create column';
                    $showCreateColumnSheet.columns = $tableColumns;
                    $showCreateColumnSheet.columnsOrder = $columnsOrder;
                }}
                actions={{
                    primary: {
                        text: 'Create column',
                        onClick: async () => {
                            $showCreateColumnSheet.show = true;
                        }
                    },
                    random: {
                        onClick: () => {
                            $randomDataModalState.show = true;
                        }
                    }
                }} />
        {/if}
    </div>
{/key}

{#if showImportCSV}
    <!-- CSVs can be text/plain or text/csv sometimes! -->
    <FilePicker
        {onSelect}
        showLocalFileBucket
        localFileBucketTitle="Upload CSV file"
        mimeTypeQuery="text/"
        allowedExtension="csv"
        bind:show={showImportCSV}
        gridImageDimensions={{
            imageHeight: 32,
            imageWidth: 32
        }} />
{/if}

<CreateRow
    {table}
    bind:showSheet={$showRowCreateSheet.show}
    bind:existingData={$showRowCreateSheet.row} />

<style>
    :global(.small-button-dimensions) {
        width: 32px !important;
        height: 32px !important;
    }
</style>
