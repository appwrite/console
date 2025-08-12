<script lang="ts">
    import { EmptySearch } from '$lib/components';
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
        showRecordsCreateSheet,
        showCreateAttributeSheet,
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
    import CreateRecord from './createRecord.svelte';
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

    async function onSelect(file: Models.File) {
        $isCsvImportInProgress = true;

        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .migrations.createCsvMigration(
                    file.bucketId,
                    file.$id,
                    `${page.params.database}:${page.params.table}`
                );

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

    onDestroy(() => ($showCreateAttributeSheet.show = false));
</script>

{#key page.params.table}
    <Container expanded expandHeightButton style="background: var(--bgcolor-neutral-primary)">
        <Layout.Stack direction="column" gap="xl">
            <Layout.Stack direction="row" justifyContent="space-between">
                <!-- TODO: verify later - columns={tableColumns} -->
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
                            disabled={!(hasColumns && hasValidColumns)}
                            on:click={() => ($showRecordsCreateSheet.show = true)}
                            event="create_row">
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Create row
                        </Button>

                        <Button
                            icon
                            secondary
                            disabled={!(hasColumns && hasValidColumns)}
                            on:click={() => ($expandTabs = !$expandTabs)}>
                            <Icon icon={!$expandTabs ? IconChevronDown : IconChevronUp} size="s" />
                        </Button>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
            {#if $isSmallViewport}
                <Button
                    secondary
                    disabled={!(hasColumns && hasValidColumns)}
                    on:click={() => ($showRecordsCreateSheet.show = true)}
                    event="create_row">
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
                <SpreadSheet {data} bind:showRecordsCreateSheet={$showRecordsCreateSheet} />
            {:else if $hasPageQueries}
                <EmptySearch hidePages>
                    <div class="common-section">
                        <div class="u-text-center common-section">
                            <b class="body-text-2 u-bold">Sorry, we couldn't find any rows.</b>
                            <p>There are no rows that match your filters.</p>
                        </div>
                        <div class="u-flex common-section u-main-center">
                            <Button
                                secondary
                                on:click={() => {
                                    queries.clearAll();
                                    queries.apply();
                                    trackEvent(Submit.FilterClear, {
                                        source: 'database_rows'
                                    });
                                }}>
                                Clear filters
                            </Button>
                        </div>
                    </div>
                </EmptySearch>
            {:else}
                <EmptySheet
                    mode="rows"
                    customColumns={createTableColumns($table.columns, selected)}
                    showActions={$canWriteRows}
                    actions={{
                        primary: {
                            text: 'Create row',
                            onClick: () => {
                                $showRecordsCreateSheet.show = true;
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
                            $showCreateAttributeSheet.show = true;
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
        mimeTypeQuery="text/"
        allowedExtension="csv"
        bind:show={showImportCSV}
        gridImageDimensions={{
            imageHeight: 32,
            imageWidth: 32
        }} />
{/if}

<CreateRecord
    table={$table}
    bind:showSheet={$showRecordsCreateSheet.show}
    bind:existingData={$showRecordsCreateSheet.row} />
