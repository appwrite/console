<script lang="ts">
    import { Filters, hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import type { Column, ColumnType } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { canWriteTables, canWriteRows } from '$lib/stores/roles';
    import { Icon, Layout, Divider, Tooltip, Typography, Link } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import {
        tableColumns,
        isTablesCsvImportInProgress,
        showRowCreateSheet,
        showCreateColumnSheet
    } from '$database/table-[table]/store';
    import SpreadSheet from '$database/table-[table]/spreadsheet.svelte';
    import { writable } from 'svelte/store';
    import FilePicker from '$lib/components/filePicker.svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        IconBookOpen,
        IconChevronDown,
        IconChevronUp,
        IconPlus,
        IconViewBoards,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import CreateRow from '$database/table-[table]/rows/create.svelte';
    import { onDestroy } from 'svelte';
    import { isCloud } from '$lib/system';
    import { columnOptions } from '$database/table-[table]/columns/store';
    import { EmptySheet, EmptySheetCards, type Field } from '$database/(entity)';
    import {
        Empty as SuggestionsEmptySheet,
        tableColumnSuggestions,
        showColumnsSuggestionsModal
    } from '$database/(suggestions)';
    import { expandTabs, randomDataModalState } from '$database/store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import IconAI from '$database/(suggestions)/icon/aiForButton.svelte';

    export let data: PageData;

    $: table = data.table;

    let isRefreshing = false;
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

    $: disableButton = canShowSuggestionsSheet;

    async function onSelect(file: Models.File, localFile = false) {
        $isTablesCsvImportInProgress = true;

        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .migrations.createCSVImport({
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
            $isTablesCsvImportInProgress = false;
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
                                isCustomTable
                                {disableButton} />
                        </div>

                        <svelte:fragment slot="tooltip">Columns</svelte:fragment>
                    </Tooltip>

                    <Tooltip>
                        <Filters
                            onlyIcon
                            query={data.query}
                            columns={filterColumns}
                            disabled={!(hasColumns && hasValidColumns) || disableButton}
                            analyticsSource="database_tables" />

                        <svelte:fragment slot="tooltip">Filters</svelte:fragment>
                    </Tooltip>
                </Layout.Stack>
                <Layout.Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    style="padding-right: 40px;">
                    <Layout.Stack
                        gap="s"
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end">
                        <Button
                            secondary
                            event={Click.DatabaseImportCsv}
                            disabled={!(hasColumns && hasValidColumns) || disableButton}
                            on:click={() => (showImportCSV = true)}>
                            Import CSV
                        </Button>
                        {#if !$isSmallViewport}
                            <Button
                                secondary
                                event="create_row"
                                disabled={!(hasColumns && hasValidColumns) || disableButton}
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
                                <Icon
                                    size="s"
                                    icon={!$expandTabs ? IconChevronDown : IconChevronUp} />
                            </Button>

                            <Tooltip disabled={isRefreshing || !data.rows.total} placement="top">
                                <Button
                                    icon
                                    size="s"
                                    secondary
                                    disabled={isRefreshing ||
                                        !data.rows.total ||
                                        !(hasColumns && hasValidColumns) ||
                                        disableButton}
                                    class="small-button-dimensions"
                                    on:click={async () => {
                                        isRefreshing = true;
                                        await invalidate(Dependencies.TABLE);
                                        isRefreshing = false;
                                    }}>
                                    <div style:line-height="0px" class:rotating={isRefreshing}>
                                        <Icon icon={IconRefresh} size="s" />
                                    </div>
                                </Button>

                                <svelte:fragment slot="tooltip">Refresh</svelte:fragment>
                            </Tooltip>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Layout.Stack>
            {#if $isSmallViewport}
                <Button
                    secondary
                    event="create_row"
                    disabled={!(hasColumns && hasValidColumns) || disableButton}
                    on:click={() => ($showRowCreateSheet.show = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create row
                </Button>
            {/if}
        </Layout.Stack>
    </Container>

    <div class="databases-spreadsheet">
        {#if hasColumns && hasValidColumns && $tableColumnSuggestions.force !== true}
            {#if data.rows.total}
                <Divider />
                <SpreadSheet {data} bind:showRowCreateSheet={$showRowCreateSheet} />
            {:else if $hasPageQueries}
                <EmptySheet
                    mode="records-filtered"
                    title="There are no rows that match your filters"
                    customColumns={createTableColumns(table.fields, selected)}>
                    {#snippet actions()}
                        <Button
                            size="s"
                            secondary
                            on:click={() => {
                                queries.clearAll();
                                queries.apply();
                                trackEvent(Submit.FilterClear, {
                                    source: 'database_tables'
                                });
                            }}>
                            Clear filters
                        </Button>
                    {/snippet}
                </EmptySheet>
            {:else}
                <EmptySheet
                    mode="records"
                    showActions={$canWriteRows}
                    customColumns={createTableColumns(table.fields, selected)}>
                    {#snippet actions()}
                        <EmptySheetCards
                            icon={IconPlus}
                            title="Create rows"
                            subtitle="Create rows manually"
                            onClick={() => {
                                $showRowCreateSheet.show = true;
                            }} />

                        <EmptySheetCards
                            icon={IconViewBoards}
                            title="Generate sample data"
                            subtitle="Generate data for testing"
                            onClick={() => {
                                $randomDataModalState.show = true;
                            }} />
                    {/snippet}
                </EmptySheet>
            {/if}
        {:else if isCloud && canShowSuggestionsSheet}
            <SuggestionsEmptySheet userColumns={$tableColumns} userDataRows={data.rows.rows} />
        {:else}
            <EmptySheet
                mode="records"
                showActions={$canWriteTables}
                title="You have no columns yet">
                {#snippet subtitle()}
                    {#if !isCloud}
                        <!-- shown on self-hosted -->
                        <Typography.Text align="center">
                            Need a hand? Learn more in the
                            <Link.Anchor
                                target="_blank"
                                href="https://appwrite.io/docs/products/databases">
                                docs.
                            </Link.Anchor>
                        </Typography.Text>
                    {/if}
                {/snippet}

                {#snippet actions()}
                    {#if isCloud}
                        <!-- shown on cloud -->
                        <EmptySheetCards
                            icon={IconAI}
                            title="Suggest columns"
                            subtitle="Use AI to generate columns"
                            onClick={() => {
                                $showColumnsSuggestionsModal = true;
                            }} />
                    {/if}

                    <EmptySheetCards
                        icon={IconPlus}
                        title="Create column"
                        subtitle="Create columns manually"
                        onClick={() => {
                            $showCreateColumnSheet.show = true;
                        }} />

                    <EmptySheetCards
                        icon={IconViewBoards}
                        title="Generate sample data"
                        subtitle="Generate data for testing"
                        onClick={() => {
                            $randomDataModalState.show = true;
                        }} />

                    {#if isCloud}
                        <!-- shown on cloud because self-hosted shows a link above -->
                        <EmptySheetCards
                            icon={IconBookOpen}
                            title="Documentation"
                            subtitle="Read the Appwrite docs"
                            href="https://appwrite.io/docs/products/databases" />
                    {/if}
                {/snippet}
            </EmptySheet>
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

    :global(.rotating) {
        animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
