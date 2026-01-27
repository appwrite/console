<script lang="ts">
    import { Filters, hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import type { Column, ColumnType } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { Icon, Layout, Divider, Tooltip } from '@appwrite.io/pink-svelte';
    import type { PageProps } from './$types';
    import FilePicker from '$lib/components/filePicker.svelte';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        IconChevronDown,
        IconChevronUp,
        IconPlus,
        IconViewBoards,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';
    import { type Models } from '@appwrite.io/console';
    import { expandTabs, randomDataModalState } from '$database/store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { EmptySheet, EmptySheetCards } from '$database/(entity)';
    import {
        isCollectionsJsonImportInProgress,
        noSqlDocument,
        collectionColumns
    } from '$database/collection-[collection]/store';
    import { canWriteRows } from '$lib/stores/roles';
    import SpreadSheet from '$database/collection-[collection]/spreadsheet.svelte';
    import ColumnDisplayNameInput from '$database/collection-[collection]/(components)/inputs/displayName.svelte';
    import { Modal } from '$lib/components';
    import { buildInitDoc } from './+layout.svelte';
    import { writable } from 'svelte/store';

    const { data }: PageProps = $props();

    const filterColumns = writable<Column[]>([]);

    let isRefreshing = $state(false);
    let showImportJson = $state(false);
    let showCustomColumnsModal = $state(false);

    let columnsError: string = $state(null);
    let spreadsheet: SpreadSheet | null = $state(null);
    let columnDisplayNameInput: ColumnDisplayNameInput | null = $state(null);

    function createFilterableColumns(): Column[] {
        return [
            { id: '$id', title: '$id', type: 'string' as ColumnType },
            { id: '$createdAt', title: '$createdAt', type: 'datetime' as ColumnType },
            { id: '$updatedAt', title: '$updatedAt', type: 'datetime' as ColumnType }
        ];
    }

    $effect(() => {
        filterColumns.set(createFilterableColumns());
    });

    async function onSelect(file: Models.File, localFile = false) {
        $isCollectionsJsonImportInProgress = true;

        console.log(file, localFile);

        try {
            /*await sdk
                .forProject(page.params.region, page.params.project)
                .migrations.createJSONImport({
                    bucketId: file.bucketId,
                    fileId: file.$id,
                    resourceId: `${page.params.database}:${page.params.collection}`,
                    internalFile: localFile
                });*/

            addNotification({
                type: 'success',
                message: 'Documents import from JSON has started'
            });

            trackEvent(Submit.DatabaseImportJSON);
        } catch (e) {
            trackError(e, Submit.DatabaseImportJSON);
            addNotification({
                type: 'error',
                message: e.message
            });
        } finally {
            $isCollectionsJsonImportInProgress = false;
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
                                disableButton={data.documents.total === 0}
                                onCustomOptionClick={() => (showCustomColumnsModal = true)} />
                        </div>

                        <svelte:fragment slot="tooltip">Columns</svelte:fragment>
                    </Tooltip>

                    <Tooltip>
                        <Filters
                            onlyIcon
                            query={data.query}
                            columns={filterColumns}
                            schema={false}
                            analyticsSource="database_collections" />

                        <svelte:fragment slot="tooltip">Filters</svelte:fragment>
                    </Tooltip>
                </Layout.Stack>
                <Layout.Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    style="padding-right: {$isSmallViewport ? '0' : '40px'};">
                    <Layout.Stack
                        gap="s"
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end">
                        <Button
                            secondary
                            disabled
                            event={Click.DatabaseImportJson}
                            on:click={() => (showImportJson = true)}>
                            Import JSON
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

                            <Tooltip
                                disabled={isRefreshing || !data.documents.total}
                                placement="top">
                                <Button
                                    icon
                                    size="s"
                                    secondary
                                    disabled={isRefreshing || !data.documents.total}
                                    class="small-button-dimensions"
                                    on:click={async () => {
                                        isRefreshing = true;
                                        await invalidate(Dependencies.COLLECTION);
                                        isRefreshing = false; /* too fast on local */
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

            <SpreadSheet bind:this={spreadsheet} {data} />
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
                        title="Create document"
                        subtitle="Create a document manually"
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

{#if showImportJson}
    <FilePicker
        {onSelect}
        showLocalFileBucket
        localFileBucketTitle="Upload JSON file"
        mimeTypeQuery="application/json,.json"
        allowedExtension="json"
        bind:show={showImportJson}
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
            spreadsheet?.refreshColumns?.();
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
