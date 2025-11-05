<script lang="ts">
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Wizard } from '$lib/layout';
    import {
        Fieldset,
        Layout,
        Typography,
        Icon,
        Divider,
        Tooltip,
        Skeleton
    } from '@appwrite.io/pink-svelte';
    import { Button, InputText, InputSelect, InputCheckbox, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import { table } from '../store';
    import { queries, type TagValue } from '$lib/components/filters/store';
    import { TagList } from '$lib/components/filters';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { toLocalDateTimeISO } from '$lib/helpers/date';
    import { writable } from 'svelte/store';
    import { isSmallViewport } from '$lib/stores/viewport';

    let showExitModal = $state(false);
    let formComponent: Form;
    let isSubmitting = writable(false);

    let selectedBucket = $state<string | null>(null);
    let buckets = $state<Models.BucketList | null>(null);
    let loadingBuckets = $state(false);

    let localQueries = $state<Map<TagValue, string>>(new Map());
    const localTags = $derived(Array.from(localQueries.keys()));

    const timestamp = toLocalDateTimeISO(Date.now())
        .replace(/[:.]/g, '-')
        .split('T')
        .join('_')
        .slice(0, -4);
    let filename = $state(`${$table.name}_${timestamp}.csv`);

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
    let emailOnComplete = $state(false);

    const columnLimit = $derived($isSmallViewport ? 6 : 9);
    const visibleColumns = $derived(showAllColumns ? $table.columns : $table.columns.slice(0, columnLimit));
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
        return queryParam ? `${url}?query=${queryParam}` : url;
    });

    function removeLocalFilter(tag: TagValue) {
        localQueries.delete(tag);
        localQueries = new Map(localQueries);
    }

    async function loadBuckets() {
        loadingBuckets = true;
        try {
            buckets = await sdk
                .forProject(page.params.region, page.params.project)
                .storage.listBuckets();

            if (buckets.buckets.length > 0 && !selectedBucket) {
                selectedBucket = buckets.buckets[0].$id;
            }
        } catch (e) {
            addNotification({
                type: 'error',
                message: 'Failed to load storage buckets'
            });
        } finally {
            loadingBuckets = false;
        }
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

        if (!selectedBucket) {
            addNotification({
                type: 'error',
                message: 'Please select a storage bucket'
            });
            return;
        }

        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .migrations.createCSVExport({
                    bucketId: selectedBucket,
                    resourceId: `${page.params.database}:${page.params.table}`,
                    filename: filename,
                    columns: selectedCols,
                    queries: exportWithFilters ? Array.from(localQueries.values()) : [],
                    delimiter: delimiterMap[delimiter],
                    header: includeHeader,
                    notify: emailOnComplete
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
    }

    onMount(() => {
        loadBuckets();
        initializeColumns();
        localQueries = new Map($queries);
    });
</script>

<Wizard title="Export CSV" columnSize="s" href={tableUrl} bind:showExitModal confirmExit column>
    <Form bind:this={formComponent} bind:isSubmitting onSubmit={handleExport}>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Destination">
                <Layout.Stack gap="l">
                    {#if loadingBuckets}
                        <Layout.Stack gap="xs">
                            <Typography.Text as="label" for="bucket" variant="m-500"
                                >Bucket</Typography.Text>
                            <Skeleton variant="line" width="100%" height={35} />
                        </Layout.Stack>
                    {:else if buckets && buckets.buckets.length > 0}
                        <InputSelect
                            id="bucket"
                            label="Bucket"
                            required
                            bind:value={selectedBucket}
                            placeholder="Select bucket"
                            options={buckets.buckets.map((bucket) => ({
                                value: bucket.$id,
                                label: bucket.name
                            }))} />
                    {:else}
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                            No storage buckets found. Please create a bucket first.
                        </Typography.Text>
                    {/if}

                    <InputText id="filename" label="Filename" bind:value={filename} />
                </Layout.Stack>
            </Fieldset>

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
                        id="delimiter"
                        label="Delimiter"
                        bind:value={delimiter}
                        options={[
                            { value: 'Comma', label: 'Comma' },
                            { value: 'Semicolon', label: 'Semicolon' },
                            { value: 'Tab', label: 'Tab' },
                            { value: 'Pipe', label: 'Pipe' }
                        ]}>
                        <Layout.Stack direction="row" gap="none" alignItems="center" slot="info">
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

                    <InputCheckbox
                        id="emailOnComplete"
                        label="Email me when export is complete"
                        description="Useful for large exports that may take a few minutes"
                        bind:checked={emailOnComplete} />
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
                disabled={$isSubmitting || !selectedBucket || selectedColumnCount === 0}>
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
