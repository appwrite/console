<script lang="ts">
    import { Filters, hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import type { Column, ColumnType } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { canWriteTables, canWriteRows } from '$lib/stores/roles';
    import { Icon, Layout, Divider } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import {
        table,
        tableColumns,
        isCsvImportInProgress,
        showRowCreateSheet,
        showCreateColumnSheet,
        type Columns,
        randomDataModalState,
        expandTabs
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
    import EmptySheet from './layout/emptySheet.svelte';
    import CreateRow from './rows/create.svelte';
    import { onDestroy } from 'svelte';

    export let data: PageData;

    let showImportCSV = false;

    // todo: might need a type fix here.
    const filterColumns = writable<Column[]>([]);

    function createTableColumns(columns: Columns[], selected: string[] = []): Column[] {
        return columns.map((column) => ({
            id: column.key,
            title: column.key,
            type: column.type as ColumnType,
            hide: !!selected?.includes(column.key),
            array: column?.array,
            format: 'format' in column && column?.format === 'enum' ? column.format : null,
            elements: 'elements' in column ? column.elements : null
        }));
    }

    $: selected = preferences.getCustomTableColumns(page.params.table);

    $: if ($table.columns) {
        const freshColumns = createTableColumns($table.columns, selected);
        tableColumns.set(freshColumns);
        filterColumns.set(freshColumns.filter((column) => !column.isAction));
    }

    $: hasColumns = !!$table.columns.length;
    $: hasValidColumns = $table?.columns?.some((col) => col.status === 'available');

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
                    <ViewSelector
                        onlyIcon
                        ui="new"
                        view={data.view}
                        columns={tableColumns}
                        hideView
                        showAnyway
                        isCustomTable />

                    <Filters
                        onlyIcon
                        query={data.query}
                        columns={filterColumns}
                        disabled={!(hasColumns && hasValidColumns)}
                        analyticsSource="database_rows" />
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
                                preferences.setKey('tableHeaderExpanded', $expandTabs);
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
                    customColumns={createTableColumns($table.columns, selected)}
                    actions={{
                        primary: {
                            text: 'Clear filters',
                            onClick: () => {
                                queries.clearAll();
                                queries.apply();
                                trackEvent(Submit.FilterClear, {
                                    source: 'database_rows'
                                });
                            }
                        }
                    }} />
            {:else}
                <EmptySheet
                    mode="rows"
                    customColumns={createTableColumns($table.columns, selected)}
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
        {:else}
            <EmptySheet
                mode="rows"
                title="You have no columns yet"
                showActions={$canWriteTables}
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
    table={$table}
    bind:showSheet={$showRowCreateSheet.show}
    bind:existingData={$showRowCreateSheet.row} />

<style>
    :global(.small-button-dimensions) {
        width: 32px !important;
        height: 32px !important;
    }
</style>
