<script lang="ts">
    import { hasPageQueries, queries } from '$lib/components/filters';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { Icon, Layout, Divider } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import FilePicker from '$lib/components/filePicker.svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IconChevronDown, IconChevronUp, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import { expandTabs, randomDataModalState } from '$database/store';
    import { EmptySheet } from '$database/(entity)';
    import { isCollectionsCsvImportInProgress } from './store';
    import { canWriteRows } from '$lib/stores/roles';
    import SpreadSheet from './spreadsheet.svelte';

    export let data: PageData;

    $: collection = data.collection;

    let showImportCSV = false;

    async function onSelect(file: Models.File, localFile = false) {
        $isCollectionsCsvImportInProgress = true;

        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .migrations.createCsvMigration({
                    bucketId: file.bucketId,
                    fileId: file.$id,
                    resourceId: `${page.params.database}:${page.params.collection}`,
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
            $isCollectionsCsvImportInProgress = false;
        }
    }
</script>

{#key page.params.collection}
    <Container expanded expandHeightButton style="background: var(--bgcolor-neutral-primary)">
        <Layout.Stack direction="column" gap="xl">
            <Layout.Stack direction="row" justifyContent="space-between">
                <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <Button
                        secondary
                        event={Click.DatabaseImportCsv}
                        on:click={() => (showImportCSV = true)}>
                        Import CSV
                    </Button>
                    {#if !$isSmallViewport}
                        <Button secondary event="create_document">
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Create document
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
                <Button secondary event="create_document">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create document
                </Button>
            {/if}
        </Layout.Stack>
    </Container>

    <div class="databases-spreadsheet">
        {#if data.documents.total}
            <Divider />

            <SpreadSheet {data} />
        {:else if $hasPageQueries}
            <EmptySheet
                mode="records-filtered"
                title="There are no documents that match your filters"
                actions={{
                    primary: {
                        text: 'Clear filters',
                        onClick: () => {
                            queries.clearAll();
                            queries.apply();
                            trackEvent(Submit.FilterClear, {
                                source: 'database_collections'
                            });
                        }
                    }
                }} />
        {:else}
            <EmptySheet
                mode="records"
                showActions={$canWriteRows}
                actions={{
                    primary: {
                        text: 'Create documents',
                        onClick: () => {
                            // some side sheet with a json editor
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

<style>
    :global(.small-button-dimensions) {
        width: 32px !important;
        height: 32px !important;
    }
</style>
