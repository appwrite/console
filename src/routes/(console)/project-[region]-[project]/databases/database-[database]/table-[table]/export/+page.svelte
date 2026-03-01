<script lang="ts">
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Layout, Icon, Divider, Tooltip } from '@appwrite.io/pink-svelte';
    import { Button, InputSelect, InputCheckbox, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { table } from '../store';
    import { queries, type TagValue } from '$lib/components/filters/store';
    import { TagList } from '$lib/components/filters';
    import { Click, Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { toLocalDateTimeISO } from '$lib/helpers/date';
    import { writable } from 'svelte/store';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { Query } from '@appwrite.io/console';

    let showExitModal = $state(false);
    let formComponent: Form;
    let isSubmitting = $state(writable(false));
    let abortController: AbortController | null = null;
    let exportProgress = 0;

    let localQueries = $state<Map<TagValue, string>>(new Map());
    const localTags = $derived(Array.from(localQueries.keys()));

    const timestamp = toLocalDateTimeISO(Date.now())
        .replace(/[:.]/g, '-')
        .split('T')
        .join('_')
        .slice(0, -4);

    let exportFormat = $state<'csv' | 'json'>('csv');
    let filename = $derived(`${$table.name}_${timestamp}.${exportFormat}`);

    let selectedColumns = $state<Record<string, boolean>>({});
    let showAllColumns = $state(false);

    type DelimiterOption = 'Comma' | 'Semicolon' | 'Tab' | 'Pipe';
    const delimiterMap: Record<DelimiterOption, string> = {
        Comma: ',',
        Semicolon: ';',
        Tab: '\t',
        Pipe: '|'
    };

    let delimiter = $state<DelimiterOption>('Comma');
    let includeHeader = $state(true);
    let exportWithFilters = $state(false);

    const columnLimit = $derived($isSmallViewport ? 6 : 9);
    const visibleColumns = $derived(
        showAllColumns ? $table.columns : $table.columns.slice(0, columnLimit)
    );
    const hasMoreColumns = $derived($table.columns.length > columnLimit);
    const selectedColumnCount = $derived(Object.values(selectedColumns).filter(Boolean).length);

    const tableUrl = $derived.by(() => {
        const queryParam = page.url.searchParams.get('query');
        const url = resolve(
            '/(console)/project-[region]-[project]/databases/database-[database]/table-[table]',
            {
                region: page.params.region,
                project: page.params.project,
                database: page.params.database,
                table: page.params.table
            }
        );
        return queryParam ? `${url}?query=${encodeURIComponent(queryParam)}` : url;
    });

    function removeLocalFilter(tag: TagValue) {
        localQueries.delete(tag);
        localQueries = new Map(localQueries);
    }

    function initializeColumns() {
        selectedColumns = Object.fromEntries($table.columns.map((col) => [col.key, true]));
    }

    function selectAllColumns() {
        selectedColumns = Object.fromEntries($table.columns.map((col) => [col.key, true]));
    }

    function deselectAllColumns() {
        selectedColumns = Object.fromEntries($table.columns.map((col) => [col.key, false]));
    }

    async function handleExport() {
        const selectedCols = Object.entries(selectedColumns)
            .filter(([_, selected]) => selected)
            .map(([key]) => key);

        if (selectedCols.length === 0) {
            addNotification({
                type: 'error',
                message: 'Please select at least one column to export'
            });
            return;
        }

        if (exportFormat === 'csv') {
            try {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .migrations.createCSVExport({
                        resourceId: `${page.params.database}:${page.params.table}`,
                        filename: filename,
                        columns: selectedCols,
                        queries: exportWithFilters ? Array.from(localQueries.values()) : [],
                        delimiter: delimiterMap[delimiter],
                        header: includeHeader,
                        notify: true
                    });

                addNotification({
                    type: 'success',
                    message: 'CSV export has started'
                });

                trackEvent(Submit.DatabaseExportCsv);
                await goto(tableUrl);
            } catch (error) {
                addNotification({
                    type: 'error',
                    message: error.message
                });

                trackError(error, Submit.DatabaseExportCsv);
            }
        } else {
            trackEvent(Submit.DatabaseExportJson); // Track event at the start of JSON export
            $isSubmitting = true;
            abortController = new AbortController(); // Initialize abort controller
            exportProgress = 0; // Reset progress

            try {
                const activeQueries = exportWithFilters ? Array.from(localQueries.values()) : [];
                const allRows: Record<string, unknown>[] = [];
                const pageSize = 100;
                let lastId: string | undefined = undefined;
                let fetched = 0;
                let total = Infinity;

                // Add a warning for potentially large exports
                addNotification({
                    type: 'info',
                    message: 'JSON export started. This may take a while for large datasets.',
                    timeout: 5000 // Keep it visible for a bit
                });

                while (fetched < total) {
                    // Check for abort signal
                    if (abortController.signal.aborted) {
                        addNotification({
                            type: 'warning',
                            message: 'JSON export cancelled.'
                        });
                        break; // Exit the loop if aborted
                    }

                    const pageQueries = [Query.limit(pageSize), ...activeQueries];

                    if (lastId) {
                        pageQueries.push(Query.cursorAfter(lastId));
                    }

                    const response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .tablesDB.listRows({
                            databaseId: page.params.database,
                            tableId: page.params.table,
                            queries: pageQueries
                        });

                    total = response.total;

                    if (response.rows.length === 0) break;

                    const filtered = response.rows.map((row) => {
                        const obj: Record<string, unknown> = {};
                        for (const col of selectedCols) {
                            obj[col] = row[col];
                        }
                        return obj;
                    });

                    allRows.push(...filtered);
                    fetched += response.rows.length;
                    lastId = response.rows[response.rows.length - 1].$id as string;
                    exportProgress = Math.min(100, Math.floor((fetched / total) * 100)); // Update progress
                }

                if (!abortController.signal.aborted) {
                    const json = JSON.stringify(allRows, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.download = filename;
                    document.body.appendChild(anchor);
                    anchor.click();

                    // Revoke the object URL after a short delay to ensure the browser has started the download
                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                        document.body.removeChild(anchor);
                    }, 100);

                    addNotification({
                        type: 'success',
                        message: `JSON export complete — ${allRows.length} row${allRows.length !== 1 ? 's' : ''} downloaded`
                    });

                    await goto(tableUrl);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    addNotification({
                        type: 'warning',
                        message: 'JSON export cancelled by user.'
                    });
                } else {
                    addNotification({
                        type: 'error',
                        message: error.message
                    });
                    trackError(error, Submit.DatabaseExportJson);
                }
            } finally {
                $isSubmitting = false;
                exportProgress = 0; // Reset progress
                abortController = null; // Clean up controller
            }
        }
    }

    // Cancel the JSON export operation
    function cancelExport() {
        if (abortController) {
            abortController.abort();
            addNotification({ type: 'info', message: 'JSON export cancellation requested.' });
        }
    }

    onMount(() => {
        initializeColumns();
        localQueries = new Map($queries);
    });
</script>

<Wizard title="Export" columnSize="s" href={tableUrl} bind:showExitModal confirmExit column>
    <Form bind:this={formComponent} bind:isSubmitting onSubmit={handleExport}>
        {#if exportFormat === 'json' && $isSubmitting}
            <div class="progress-container" style="margin-top:1rem;">
                <div class="progress-bar" role="progressbar" aria-label="Export progress" aria-valuenow={exportProgress} aria-valuemin="0" aria-valuemax="100" style="background:linear-gradient(to right, #4caf50 {exportProgress}%, #e0e0e0 0%); height:1rem; border-radius:0.25rem;"></div>
                <button type="button" class="cancel-btn" on:click={cancelExport} style="margin-left:0.5rem;">Cancel</button>
            </div>
        {/if}
        <Layout.Stack gap="xxl">
            <Fieldset legend="Columns">
                <Layout.Stack gap="l">
                    <Layout.Stack direction="row" gap="s" alignItems="center">
                        <Button compact on:click={selectAllColumns}>Select all</Button>
                        <span style:height="20px">
                            <Divider vertical />
                        </span>
                        <Button compact on:click={deselectAllColumns}>Deselect all</Button>
                    </Layout.Stack>

                    <Layout.Grid columns={3} columnsS={1} gap="l">
                        {#each visibleColumns as column (column.key)}
                            <div style="min-width: 0;">
                                <InputCheckbox
                                    id={`column-${column.key}`}
                                    label={column.key}
                                    bind:checked={selectedColumns[column.key]}
                                    truncate />
                            </div>
                        {/each}
                    </Layout.Grid>

                    {#if hasMoreColumns}
                        <div style:margin-bottom="-0.5rem">
                            <Button compact on:click={() => (showAllColumns = !showAllColumns)}>
                                {showAllColumns ? 'Show less' : 'Show more'}
                            </Button>
                        </div>
                    {/if}
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Export options">
                <Layout.Stack gap="l">
                    <InputSelect
                        id="exportFormat"
                        label="Format"
                        bind:value={exportFormat}
                        options={[
                            { value: 'csv', label: 'CSV' },
                            { value: 'json', label: 'JSON' }
                        ]} />

                    {#if exportFormat === 'csv'}
                        <InputSelect
                            id="delimiter"
                            label="Delimiter"
                            bind:value={delimiter}
                            options={[
                                { value: 'Comma', label: 'Comma' },
                                { value: 'Semicolon', label: 'Semicolon' },
                                { value: 'Tab', label: 'Tab' },
                                { value: 'Pipe', label: 'Pipe' }
                            ]}>
                            <Layout.Stack
                                direction="row"
                                gap="none"
                                alignItems="center"
                                slot="info">
                                <Tooltip>
                                    <Icon size="s" icon={IconInfo} />
                                    <span slot="tooltip">
                                        Define how to separate values in the exported file.
                                    </span>
                                </Tooltip>
                            </Layout.Stack>
                        </InputSelect>

                        <InputCheckbox
                            id="includeHeader"
                            label="Include header row"
                            description="Column names will be added as the first row in the CSV"
                            bind:checked={includeHeader} />
                    {/if}

                    <Layout.Stack gap="m">
                        <div class:disabled-checkbox={localTags.length === 0}>
                            <InputCheckbox
                                id="exportWithFilters"
                                label="Export with filters"
                                description="Export rows that match the current table filters"
                                disabled={localTags.length === 0}
                                bind:checked={exportWithFilters} />
                        </div>

                        {#if localTags.length > 0}
                            <Layout.Stack
                                direction="row"
                                gap="xs"
                                alignItems="center"
                                style="padding-left: 1.75rem;"
                                wrap="wrap">
                                <TagList
                                    tags={localTags}
                                    on:remove={(e) => {
                                        removeLocalFilter(e.detail);
                                    }} />
                            </Layout.Stack>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Fieldset>
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="footer">
        <Layout.Stack justifyContent="flex-end" direction="row">
            <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>
                Cancel
            </Button>
            <Button
                fullWidthMobile
                on:click={() => {
                    trackEvent(
                        exportFormat === 'json' ? Click.DatabaseExportJson : Click.DatabaseExportCsv
                    );
                    formComponent.triggerSubmit();
                }}
                disabled={$isSubmitting || selectedColumnCount === 0}>
                Export
            </Button>
        </Layout.Stack>
    </svelte:fragment>
</Wizard>

<style>
    .disabled-checkbox :global(*) {
        cursor: unset;
    }
</style>
