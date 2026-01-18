<script lang="ts">
    import { hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { Icon, Layout, Divider, Tooltip } from '@appwrite.io/pink-svelte';
    import type { PageProps } from './$types';
    import FilePicker from '$lib/components/filePicker.svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        IconChevronDown,
        IconChevronUp,
        IconPlus,
        IconViewBoards
    } from '@appwrite.io/pink-icons-svelte';
    import { ID, type Models } from '@appwrite.io/console';
    import { expandTabs, randomDataModalState } from '$database/store';
    import { EmptySheet, EmptySheetCards } from '$database/(entity)';
    import {
        isCollectionsCsvImportInProgress,
        noSqlDocument,
        collectionColumns
    } from '$database/collection-[collection]/store';
    import { canWriteRows } from '$lib/stores/roles';
    import SpreadSheet from '$database/collection-[collection]/spreadsheet.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import ColumnDisplayNameInput from '$database/collection-[collection]/(components)/inputs/displayName.svelte';
    import { Modal } from '$lib/components';

    const { data }: PageProps = $props();

    let showImportCSV = $state(false);
    let showCustomColumnsModal = $state(false);

    let columnsError: string = $state(null);
    let columnDisplayNameInput: ColumnDisplayNameInput | null = $state(null);

    function buildInitDoc() {
        const now = new Date().toISOString();
        return {
            $id: ID.unique(),
            $createdAt: toLocaleDateTime(now),
            $updatedAt: toLocaleDateTime(now)
        };
    }

    async function onSelect(file: Models.File, localFile = false) {
        $isCollectionsCsvImportInProgress = true;

        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .migrations.createCSVImport({
                    bucketId: file.bucketId,
                    fileId: file.$id,
                    resourceId: `${page.params.database}:${page.params.collection}`,
                    internalFile: localFile
                });

            addNotification({
                type: 'success',
                message: 'Documents import from csv has started'
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
                <Layout.Stack direction="row" gap="s">
                    <Tooltip>
                        <div>
                            <ViewSelector
                                onlyIcon
                                ui="new"
                                hideView
                                showAnyway
                                isCustomTable
                                view={data.view}
                                columns={collectionColumns}
                                onCustomOptionClick={() => (showCustomColumnsModal = true)} />
                        </div>

                        <svelte:fragment slot="tooltip">Columns</svelte:fragment>
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
                            on:click={() => (showImportCSV = true)}>
                            Import CSV
                        </Button>
                        {#if !$isSmallViewport}
                            <Button
                                secondary
                                event="create_document"
                                on:click={() => {
                                    if (!$noSqlDocument.isNew) {
                                        noSqlDocument.create(buildInitDoc());
                                    }
                                }}>
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
                                <Icon
                                    icon={!$expandTabs ? IconChevronDown : IconChevronUp}
                                    size="s" />
                            </Button>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Layout.Stack>
            {#if $isSmallViewport}
                <Button
                    secondary
                    event="create_document"
                    on:click={() => {
                        if (!$noSqlDocument.isNew) {
                            noSqlDocument.create(buildInitDoc());
                        }
                    }}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create document
                </Button>
            {/if}
        </Layout.Stack>
    </Container>

    <div class="databases-spreadsheet">
        {#if data.documents.total || $noSqlDocument.isDirty}
            <Divider />

            <SpreadSheet {data} />
        {:else if $hasPageQueries}
            <EmptySheet
                mode="records-filtered"
                title="There are no documents that match your filters">
                {#snippet actions()}
                    <Button
                        size="s"
                        secondary
                        on:click={() => {
                            queries.clearAll();
                            queries.apply();
                            trackEvent(Submit.FilterClear, {
                                source: 'database_collections'
                            });
                        }}>
                        Clear filters
                    </Button>
                {/snippet}
            </EmptySheet>
        {:else}
            <EmptySheet mode="records" type="documentsdb" showActions={$canWriteRows}>
                {#snippet actions()}
                    <EmptySheetCards
                        icon={IconPlus}
                        title="Create documents"
                        subtitle="Create documents manually"
                        onClick={() => {
                            noSqlDocument.create(buildInitDoc());
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

<Modal
    title="Custom columns"
    bind:error={columnsError}
    bind:show={showCustomColumnsModal}
    onSubmit={async () => {
        await columnDisplayNameInput?.updateDisplayNames();
    }}>
    <svelte:fragment slot="description">
        Add up to 5 document fields to display as columns in the table view for easy identification.
    </svelte:fragment>

    <ColumnDisplayNameInput
        inModal
        bind:this={columnDisplayNameInput}
        databaseType={data.database.type}
        collectionId={page.params.collection}
        onSuccess={() => {
            columnsError = null;
            showCustomColumnsModal = false;
        }}
        onFailure={(error) => {
            columnsError = error.message;
        }} />

    <svelte:fragment slot="footer">
        <Button size="s" secondary on:click={() => (showCustomColumnsModal = false)}>Cancel</Button>

        <Button size="s" submit disabled={columnDisplayNameInput?.hasChanged()}>Update</Button>
    </svelte:fragment>
</Modal>

<style>
    :global(.small-button-dimensions) {
        width: 32px !important;
        height: 32px !important;
    }
</style>
