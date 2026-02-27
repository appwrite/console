<script lang="ts">
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Layout, Divider, Icon, Typography } from '@appwrite.io/pink-svelte';
    import { Button, InputCheckbox, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { table } from '../store';
    import { queries, type TagValue } from '$lib/components/filters/store';
    import { TagList } from '$lib/components/filters';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { toLocalDateTimeISO } from '$lib/helpers/date';
    import { writable } from 'svelte/store';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { buildWildcardColumnsQuery } from '../rows/store';
    import { jsonExportStore } from '$lib/stores/jsonExport';
    import type { Entity } from '$database/(entity)';

    let showExitModal = $state(false);
    let formComponent: Form;
    let isSubmitting = $state(writable(false));

    let localQueries = $state<Map<TagValue, string>>(new Map());
    const localTags = $derived(Array.from(localQueries.keys()));

    const timestamp = toLocalDateTimeISO(Date.now())
        .replace(/[:.]/g, '-')
        .split('T')
        .join('_')
        .slice(0, -4);
    const filename = `${$table.name}_${timestamp}.json`;

    let selectedColumns = $state<Record<string, boolean>>({});
    let showAllColumns = $state(false);

    let prettyPrint = $state(true);
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

        const filterQueries = exportWithFilters ? [...localQueries.values()] : [];
        const wildcardQueries = buildWildcardColumnsQuery($table as Entity);

        trackEvent(Submit.DatabaseExportJson);

        // Dispatch to the background store — progress box will handle the rest
        jsonExportStore.startExport({
            region: page.params.region,
            project: page.params.project,
            databaseId: page.params.database,
            tableId: page.params.table,
            tableName: $table.name,
            filename,
            columns: selectedCols,
            queries: filterQueries,
            wildcardQueries,
            prettyPrint
        });

        addNotification({
            type: 'success',
            message: 'JSON export has started'
        });

        await goto(tableUrl);
    }

    onMount(() => {
        initializeColumns();
        localQueries = new Map($queries);
    });
</script>

<Wizard title="Export JSON" columnSize="s" href={tableUrl} bind:showExitModal confirmExit column>
    <Form bind:this={formComponent} bind:isSubmitting onSubmit={handleExport}>
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
                    <InputCheckbox
                        id="prettyPrint"
                        label="Pretty print"
                        description="Format the JSON output with indentation for readability"
                        bind:checked={prettyPrint} />

                    <InputCheckbox
                        id="notify"
                        label="Notify by email"
                        description="Send an email with the download link when the export is complete (Note: Currently only supported for CSV; JSON support coming soon)"
                        disabled
                        checked={false} />

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

                    <Divider />

                    <Layout.Stack direction="row" gap="s" alignItems="center">
                        <Icon icon={IconInfo} size="s" />
                        <Typography.Text size="small" variant="m-400">
                            System fields ($id, $createdAt, $updatedAt) are always included in the export.
                        </Typography.Text>
                    </Layout.Stack>

                    <div class="u-margin-block-start-16">
                        <p class="u-color-text-warning u-font-size-80 u-flex u-gap-8 u-cross-center">
                            <span class="icon-exclamation-circle" aria-hidden="true"></span>
                            Client-side export is limited to 5,000 rows. For larger tables, please apply filters.
                        </p>
                    </div>
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
                on:click={() => formComponent.triggerSubmit()}
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
