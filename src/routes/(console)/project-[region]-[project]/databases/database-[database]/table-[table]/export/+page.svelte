<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Wizard } from '$lib/layout';
    import {
        Fieldset,
        Layout,
        Spinner,
        Typography,
        Popover,
        Icon,
        Divider
    } from '@appwrite.io/pink-svelte';
    import { Button, InputText, InputSelect, InputCheckbox, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import { table } from '../store';
    import { tags, queries } from '$lib/components/filters/store';
    import { TagList } from '$lib/components/filters';
    import { writable } from 'svelte/store';

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);

    let selectedBucket: string = null;
    let buckets: Models.BucketList = null;
    let loadingBuckets = false;

    // Generate default filename: tablename_timestamp.csv
    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .split('T')
        .join('_')
        .slice(0, -5);
    let filename = `${$table.name}_${timestamp}.csv`;

    let selectedColumns: Record<string, boolean> = {};
    let showAllColumns = false;

    type DelimiterOption = 'Comma' | 'Semicolon' | 'Tab' | 'Pipe';
    let delimiter: DelimiterOption = 'Comma';
    let includeHeader = true;
    let exportWithFilters = false;
    let emailOnComplete = false;

    $: visibleColumns = showAllColumns ? $table.columns : $table.columns.slice(0, 9);
    $: hasMoreColumns = $table.columns.length > 9;
    $: selectedColumnCount = Object.values(selectedColumns).filter(Boolean).length;

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
        // Initialize all columns as selected
        selectedColumns = {};
        $table.columns.forEach((col) => {
            selectedColumns[col.key] = true;
        });
    }

    function selectAllColumns() {
        $table.columns.forEach((col) => {
            selectedColumns[col.key] = true;
        });
    }

    function deselectAllColumns() {
        $table.columns.forEach((col) => {
            selectedColumns[col.key] = false;
        });
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
                    queries: exportWithFilters ? Array.from($queries.values()) : [],
                    delimiter: delimiter,
                    header: includeHeader,
                    notify: emailOnComplete
                });

            addNotification({
                type: 'success',
                message: 'CSV export has started'
            });

            // TODO: Add analytics tracking
            // trackEvent(Submit.DatabaseExportCsv);

            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            // trackError(error, Submit.DatabaseExportCsv);
        }
    }

    loadBuckets();
    initializeColumns();
</script>

<Wizard
    title="Export CSV"
    columnSize="m"
    href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}`}
    bind:showExitModal
    confirmExit
    column>
    <Form bind:this={formComponent} onSubmit={handleExport} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Destination">
                <Layout.Stack gap="l">
                    {#if loadingBuckets}
                        <div class="u-flex u-main-center">
                            <Spinner />
                        </div>
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

                    <div
                        style="display: grid; grid-template-columns: repeat(3, 1fr); row-gap: 1.25rem; column-gap: 1rem; margin-left: -0.125rem;">
                        {#each visibleColumns as column}
                            <InputCheckbox
                                id={`column-${column.key}`}
                                label={column.key}
                                bind:checked={selectedColumns[column.key]} />
                        {/each}
                    </div>

                    {#if hasMoreColumns}
                        <button type="button" on:click={() => (showAllColumns = !showAllColumns)}>
                            {showAllColumns ? 'Show less' : 'Show more'}
                        </button>
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
                            <Popover let:toggle>
                                <Button extraCompact size="s" on:click={toggle}>
                                    <Icon size="s" icon={IconInfo} />
                                </Button>
                                <Typography.Text slot="tooltip">
                                    Define how to separate values in the exported file.
                                </Typography.Text>
                            </Popover>
                        </Layout.Stack>
                    </InputSelect>

                    <InputCheckbox
                        id="includeHeader"
                        label="Include header row"
                        description="Column names will be added as the first row in the CSV"
                        bind:checked={includeHeader} />

                    <InputCheckbox
                        id="exportWithFilters"
                        label="Export with filters"
                        description="Export rows that match the current table filters"
                        bind:checked={exportWithFilters} />

                    {#if $tags.length > 0}
                        <ul
                            class="u-flex u-flex-wrap u-cross-center u-gap-8 tags"
                            style="padding-left: 1.75rem;">
                            <TagList
                                tags={$tags}
                                on:remove={(e) => {
                                    queries.removeFilter(e.detail);
                                    queries.apply();
                                }} />
                        </ul>
                    {:else}
                        <Typography.Text
                            variant="m-400"
                            color="--fgcolor-neutral-tertiary"
                            style="padding-left: 1.75rem;">
                            No active filters
                        </Typography.Text>
                    {/if}

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
