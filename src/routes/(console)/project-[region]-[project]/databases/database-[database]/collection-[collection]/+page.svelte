<script lang="ts">
    import { EmptySearch } from '$lib/components';
    import { Filters, hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import type { Column, ColumnType } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { canWriteCollections, canWriteDocuments } from '$lib/stores/roles';
    import { Icon, Layout, Divider } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { collection, columns, isCsvImportInProgress, showRecordsCreateSheet } from './store';
    import SpreadSheet from './spreadsheet.svelte';
    import { writable } from 'svelte/store';
    import FilePicker from '$lib/components/filePicker.svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IconPlus, IconSearch } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import EmptySheet from './layout/emptySheet.svelte';
    import CreateRecord from './createRecord.svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    export let data: PageData;

    let showImportCSV = false;
    const filterColumns = writable<Column[]>([]);

    $: selected = preferences.getCustomCollectionColumns(page.params.collection);

    $: columns.set(
        $collection.attributes.map((attribute) => ({
            id: attribute.key,
            title: attribute.key,
            type: attribute.type as ColumnType,
            hide: !!selected?.includes(attribute.key),
            array: attribute?.array,
            format: 'format' in attribute && attribute?.format === 'enum' ? attribute.format : null,
            elements: 'elements' in attribute ? attribute.elements : null
        }))
    );

    $: filterColumns.set([...$columns.filter((column) => !column.isAction)]);

    $: hasAttributes = !!$collection.attributes.length;
    $: hasValidAttributes = $collection?.attributes?.some((attr) => attr.status === 'available');

    async function onSelect(file: Models.File) {
        $isCsvImportInProgress = true;

        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .migrations.createCsvMigration(
                    file.bucketId,
                    file.$id,
                    `${page.params.database}:${page.params.collection}`
                );

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
            $isCsvImportInProgress = false;
        }
    }
</script>

{#key page.params.collection}
    <Container expanded style="background: var(--bgcolor-neutral-primary)">
        <Layout.Stack direction="column" gap="xl">
            <Layout.Stack direction="row" justifyContent="space-between">
                <Layout.Stack direction="row" gap="s">
                    <ViewSelector
                        onlyIcon
                        ui="new"
                        view={data.view}
                        {columns}
                        hideView
                        isCustomCollection />

                    <Filters
                        onlyIcon
                        query={data.query}
                        columns={filterColumns}
                        disabled={!(hasAttributes && hasValidAttributes)}
                        analyticsSource="database_documents" />

                    <!-- TODO: not yet implemented -->
                    <!--                    <Button icon secondary>-->
                    <!--                        <Icon icon={IconSearch} slot="start" />-->
                    <!--                    </Button>-->
                </Layout.Stack>
                <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <Button
                        secondary
                        event={Click.DatabaseImportCsv}
                        disabled={!(hasAttributes && hasValidAttributes)}
                        on:click={() => (showImportCSV = true)}>
                        Import CSV
                    </Button>
                    {#if !$isSmallViewport}
                        <Button
                            secondary
                            disabled={!(hasAttributes && hasValidAttributes)}
                            on:click={() => ($showRecordsCreateSheet.show = true)}
                            event="create_document">
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Create document
                        </Button>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
            {#if $isSmallViewport}
                <Button
                    secondary
                    disabled={!(hasAttributes && hasValidAttributes)}
                    on:click={() => ($showRecordsCreateSheet.show = true)}
                    event="create_document">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create document
                </Button>
            {/if}
        </Layout.Stack>
    </Container>

    <div class="databases-spreadsheet">
        {#if hasAttributes && hasValidAttributes}
            {#if data.documents.total}
                <Divider />
                <SpreadSheet {data} bind:showRecordsCreateSheet={$showRecordsCreateSheet} />
            {:else if $hasPageQueries}
                <EmptySearch hidePages>
                    <div class="common-section">
                        <div class="u-text-center common-section">
                            <b class="body-text-2 u-bold">Sorry, we couldn't find any documents.</b>
                            <p>There are no documents that match your filters.</p>
                        </div>
                        <div class="u-flex common-section u-main-center">
                            <Button
                                secondary
                                on:click={() => {
                                    queries.clearAll();
                                    queries.apply();
                                    trackEvent(Submit.FilterClear, {
                                        source: 'database_documents'
                                    });
                                }}>
                                Clear filters
                            </Button>
                        </div>
                    </div>
                </EmptySearch>
            {:else}
                <EmptySheet
                    mode="records"
                    showActions={$canWriteDocuments}
                    actions={{
                        primary: {
                            onClick: () => {
                                $showRecordsCreateSheet.show = true;
                            }
                        }
                    }} />
            {/if}
        {:else}
            <EmptySheet
                mode="records"
                title="You have no columns yet"
                showActions={$canWriteCollections}
                actions={{
                    primary: {
                        text: 'Create column',
                        onClick: async () => {
                            await goto(
                                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/collection-${page.params.collection}/attributes`
                            );
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
    collection={$collection}
    bind:showSheet={$showRecordsCreateSheet.show}
    bind:existingData={$showRecordsCreateSheet.document} />
