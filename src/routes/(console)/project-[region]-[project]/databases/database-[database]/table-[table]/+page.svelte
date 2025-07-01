<script lang="ts">
    import { Empty, EmptySearch, PaginationWithLimit } from '$lib/components';
    import { Filters, hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import type { Column, ColumnType } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { canWriteTables, canWriteRows } from '$lib/stores/roles';
    import { Card, Icon, Layout, Empty as PinkEmpty } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import CreateColumnDropdown from './columns/createColumnDropdown.svelte';
    import type { Option } from './columns/store';
    import CreateColumn from './createColumn.svelte';
    import { table, tableColumns, isCsvImportInProgress } from './store';
    import Table from './table.svelte';
    import { writable } from 'svelte/store';
    import FilePicker from '$lib/components/filePicker.svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { base } from '$app/paths';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import { flags } from '$lib/flags';

    export let data: PageData;

    let showImportCSV = false;
    let showCreateColumn = false;
    let selectedColumn: Option['name'] = null;

    const filterColumns = writable<Column[]>([]);

    $: selected = preferences.getCustomTableColumns(page.params.table);
    $: tableColumns.set(
        $table.columns.map((column) => ({
            id: column.key,
            title: column.key,
            type: column.type as ColumnType,
            hide: !selected?.includes(column.key),
            array: column?.array,
            format: 'format' in column && column?.format === 'enum' ? column.format : null,
            elements: 'elements' in column ? column.elements : null
        }))
    );
    $: filterColumns.set([
        ...$tableColumns,
        ...['$id', '$createdAt', '$updatedAt'].map((id) => ({
            id,
            title: id,
            hide: false,
            type: (id === '$id' ? 'string' : 'datetime') as ColumnType
        }))
    ]);

    $: hasColumns = !!$table.columns.length;
    $: hasValidColumns = $table?.columns?.some((attr) => attr.status === 'available');

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
</script>

{#key page.params.table}
    <Container>
        <Layout.Stack direction="column" gap="xl">
            <Layout.Stack direction="row" justifyContent="space-between">
                <Filters
                    query={data.query}
                    columns={filterColumns}
                    disabled={!(hasColumns && hasValidColumns)}
                    analyticsSource="database_rows" />
                <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <ViewSelector view={data.view} columns={tableColumns} hideView isCustomCollection />
                    {#if flags.showCsvImport(data)}
                        <Button
                            secondary
                            event={Click.DatabaseImportCsv}
                            disabled={!(hasColumns && hasValidColumns)}
                            on:click={() => (showImportCSV = true)}>
                            Import CSV
                        </Button>
                    {/if}
                    {#if !$isSmallViewport}
                        <Button
                            disabled={!(hasColumns && hasValidColumns)}
                            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}/create`}
                            event="create_row">
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Create row
                        </Button>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
            {#if $isSmallViewport}
                <Button
                    disabled={!(hasColumns && hasValidColumns)}
                    href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}/create`}
                    event="create_row">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create row
                </Button>
            {/if}
        </Layout.Stack>

        {#if hasColumns && hasValidColumns}
            {#if data.rows.total}
                <Table {data} />

                <PaginationWithLimit
                    name="Rows"
                    limit={data.limit}
                    offset={data.offset}
                    total={data.rows.total} />
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
                <Empty
                    allowCreate={$canWriteRows}
                    single
                    href="https://appwrite.io/docs/products/databases/rows"
                    target="row">
                    <svelte:fragment slot="actions">
                        <Button
                            external
                            href="https://appwrite.io/docs/products/databases/rows"
                            text
                            event="empty_documentation"
                            size="s"
                            ariaLabel="create row">Documentation</Button>
                        <Button
                            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}/create`}
                            secondary
                            disabled={!$canWriteRows}
                            size="s">
                            Create row
                        </Button>
                    </svelte:fragment>
                </Empty>
            {/if}
        {:else}
            <Card.Base padding="none">
                <PinkEmpty
                    title="Create a column to get started."
                    description="Need a hand? Learn more in our documentation.">
                    <slot name="actions" slot="actions">
                        <Button
                            external
                            href="https://appwrite.io/docs/products/databases/tables#columns"
                            text
                            event="empty_documentation"
                            size="s">Documentation</Button>
                        {#if $canWriteTables}
                            <CreateColumnDropdown
                                bind:selectedOption={selectedColumn}
                                bind:showCreate={showCreateColumn}
                                let:toggle>
                                <Button secondary event="create_column" on:click={toggle}>
                                    Create column
                                </Button>
                            </CreateColumnDropdown>
                        {/if}
                    </slot>
                </PinkEmpty>
            </Card.Base>
        {/if}
    </Container>
{/key}

{#if showCreateColumn}
    <CreateColumn bind:showCreate={showCreateColumn} bind:selectedOption={selectedColumn} />
{/if}

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
