<script lang="ts">
    import { page } from '$app/state';
    import { goto, invalidate } from '$app/navigation';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Confirm, Id, SortButton } from '$lib/components';
    import { Dependencies, SPREADSHEET_PAGE_LIMIT } from '$lib/constants';
    import { Button as ConsoleButton, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { type Models, Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import type { Column } from '$lib/helpers/types';
    import {
        Spreadsheet,
        Button,
        Layout,
        Badge,
        FloatingActionBar,
        Icon,
        Typography
    } from '@appwrite.io/pink-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import {
        IconCalendar,
        IconDotsHorizontal,
        IconFingerPrint
    } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import { SpreadsheetContainer } from '$database/(entity)';
    import { copy } from '$lib/helpers/copy';
    import { writable } from 'svelte/store';
    import { pageToOffset } from '$lib/helpers/load';
    import { hash } from '$lib/helpers/string';
    import { formatNumberWithCommas } from '$lib/helpers/numbers';
    import { chunks } from '$lib/helpers/array';
    import { mapToQueryParams } from '$lib/components/filters/store';
    import { expandTabs, buildWildcardEntitiesQuery } from '$database/store';
    import {
        collectionColumns,
        documentActivitySheet,
        documentPermissionSheet,
        noSqlDocument,
        paginatedDocuments,
        paginatedDocumentsLoading,
        sortState
    } from './store';
    import {
        type SortState,
        randomDataModalState,
        spreadsheetRenderKey,
        spreadsheetLoading
    } from '$database/store';
    import { type JsonValue, NoSqlEditor } from './(components)/editor';

    import { buildFieldUrl } from '$database/table-[table]/rows/store';
    import {
        SpreadsheetOptions,
        type HeaderCellAction,
        type RowCellAction
    } from '$database/(entity)';

    export let data: PageData;

    $: collection = data.collection;
    $: documents = writable(data.documents);
    $: if (documents) {
        paginatedDocuments.clear();
        paginatedDocuments.setPage(1, $documents.documents);
    }

    const databaseId = page.params.database;
    const collectionId = page.params.collection;

    const emptyCellsLimit = $spreadsheetLoading
        ? 30
        : $isSmallViewport
          ? 12
          : $isTabletViewport
            ? 18
            : 24;

    let selectedDocuments = [];
    let spreadsheetContainer: SpreadsheetContainer;

    let currentPage = 1;
    let jumpToPageReactive = 0;

    let showDelete = false;
    let selectedDocumentForDelete: Models.Document['$id'] | null = null;

    async function loadRemoteDocument() {
        try {
            $noSqlDocument.show = true;
            $noSqlDocument.loading = true;
            const documentId = $noSqlDocument.documentId;
            $noSqlDocument.documentId = null; // reset for later!

            const loadedDocument = await sdk
                .forProject(page.params.region, page.params.project)
                .documentsDB.getDocument({
                    databaseId: page.params.database,
                    collectionId: page.params.collection,
                    documentId
                });

            if (loadedDocument) {
                $noSqlDocument.isNew = false;
                $noSqlDocument.document = loadedDocument;
            }
        } catch (e) {
            markFirstDocumentSelected();
            addNotification({
                type: 'error',
                message: e.message
            });
        } finally {
            $noSqlDocument.loading = false;
        }
    }

    function markFirstDocumentSelected() {
        const firstDocument = $documents?.documents?.[0];
        if (firstDocument) {
            $noSqlDocument.document = firstDocument;
        }
    }

    onMount(async () => {
        sortState.set(data.currentSort as SortState);

        if (data.documents.documents.length) {
            paginatedDocuments.clear();
            paginatedDocuments.setPage(1, data.documents.documents);
        }

        // documentId exists!
        if ($noSqlDocument.documentId) {
            await loadRemoteDocument();
        } else {
            markFirstDocumentSelected();
        }
    });

    function makeCollectionColumns() {
        const selectedColumnsToHide = preferences.getCustomTableColumns(collectionId);
        const staticColumns: Column[] = [
            {
                id: '$id',
                title: '$id',
                width: 225,
                minimumWidth: 225,
                draggable: false,
                type: 'string',
                icon: IconFingerPrint,
                isEditable: false,
                isPrimary: false,
                hide: !!selectedColumnsToHide?.includes('$id')
            },
            {
                id: '$createdAt',
                title: '$createdAt',
                width: 200,
                minimumWidth: 200,
                draggable: false,
                type: 'datetime',
                icon: IconCalendar,
                isEditable: false,
                hide: !!selectedColumnsToHide?.includes('$createdAt')
            },
            {
                id: '$updatedAt',
                title: '$updatedAt',
                width: 200,
                minimumWidth: 200,
                draggable: false,
                type: 'datetime',
                icon: IconCalendar,
                isEditable: false,
                hide: !!selectedColumnsToHide?.includes('$updatedAt')
            },
            {
                id: 'actions',
                title: '',
                width: 40,
                isAction: true,
                draggable: false,
                type: 'string',
                resizable: false,
                isEditable: false,
                hide: false
            }
        ];

        collectionColumns.set(staticColumns);
    }

    async function sort(query: string | null) {
        $spreadsheetLoading = true;
        const url = new URL(page.url);
        const parsedQueries = data.parsedQueries;

        if (parsedQueries.size > 0) {
            for (const [tagValue, queryString] of parsedQueries.entries()) {
                if (queryString.includes('orderAsc') || queryString.includes('orderDesc')) {
                    parsedQueries.delete(tagValue);
                }
            }
        }

        if (query !== null) {
            const { attribute, method } = JSON.parse(query);
            const tagValue = {
                tag: `${attribute} ${method}`,
                value: attribute
            };

            parsedQueries.set(tagValue, query);
        }

        if (parsedQueries.size === 0) {
            url.searchParams.delete('query');
        } else {
            url.searchParams.set('query', mapToQueryParams(parsedQueries));
        }

        // save > navigate > restore!
        spreadsheetContainer.saveGridSheetScroll();
        await goto(`${url.pathname}${url.search}`);
        spreadsheetContainer.restoreGridSheetScroll();

        $spreadsheetLoading = false;
        markFirstDocumentSelected();
    }

    async function handleDelete() {
        showDelete = false;
        let hadErrors = false;

        try {
            if (selectedDocumentForDelete) {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .documentsDB.deleteDocument({
                        databaseId,
                        collectionId,
                        documentId: selectedDocumentForDelete
                    });
            } else {
                if (selectedDocuments.length) {
                    const documentsSDK = sdk.forProject(
                        page.params.region,
                        page.params.project
                    ).documentsDB;

                    for (const batch of chunks(selectedDocuments, 100)) {
                        await documentsSDK.deleteDocuments({
                            databaseId,
                            collectionId,
                            queries: [Query.equal('$id', batch)]
                        });
                    }
                }
            }

            await invalidate(Dependencies.DOCUMENTS);
            trackEvent(Click.DatabaseRowDelete);

            if (!hadErrors) {
                // error is already shown above!
                addNotification({
                    type: 'success',
                    message: `${selectedDocuments.length ? selectedDocuments.length : 1} document${selectedDocuments.length > 1 ? 's' : ''} deleted`
                });
            }

            spreadsheetRenderKey.set(
                hash([
                    data.documents.total.toString(),
                    ...(selectedDocuments as string[]),
                    selectedDocumentForDelete
                ])
            );
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.DocumentDelete);
        } finally {
            selectedDocuments = [];
            showDelete = false;
            selectedDocumentForDelete = null;
        }
    }

    async function onSelectSheetOption(
        action: HeaderCellAction | RowCellAction,
        document: Models.Document | null = null
    ) {
        if (action === 'update') {
            noSqlDocument.set({
                document: document,
                isNew: false,
                show: true
            });
        }

        if (action === 'duplicate-row') {
            /**
             * remove dates because
             * console can override timestamps!
             */
            const { $createdAt, $updatedAt, ...documentWithoutDates } = document;

            noSqlDocument.set({
                document: documentWithoutDates,
                isNew: true,
                show: true
            });
        }

        if (action === 'permissions') {
            $documentPermissionSheet.show = true;
            $documentPermissionSheet.document = document;
        }

        if (action === 'copy-url') {
            try {
                await copy(buildFieldUrl('document', document.$id));
                addNotification({
                    type: 'success',
                    message: 'Document url copied'
                });
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
            }
        }

        if (action === 'copy-json') {
            const stringified = JSON.stringify(document, null, 2);
            try {
                await copy(stringified);
                addNotification({
                    type: 'success',
                    message: 'Document copied'
                });
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
            }
        }

        if (action === 'delete') {
            // showDelete = true;
            // selectedRowForDelete = document.$id;
        }

        if (action === 'activity') {
            $documentActivitySheet.show = true;
            $documentActivitySheet.document = document;
        }
    }

    // possibly for auto-save!
    async function createOrUpdateDocument(jsonValue: JsonValue) {
        const document = jsonValue as Models.Document;
        const documentsDB = sdk.forProject(page.params.region, page.params.project).documentsDB;

        /**
         * remove dates because
         * console can override timestamps!
         */
        const { $createdAt, $updatedAt, $id, ...documentWithoutDates } = document;

        try {
            if ($noSqlDocument.isNew) {
                // create
                await documentsDB.createDocument({
                    databaseId,
                    collectionId,
                    documentId: $id,
                    data: documentWithoutDates ?? []
                });

                trackEvent(Submit.DocumentCreate);
                addNotification({
                    message: 'Document has been created',
                    type: 'success'
                });
            } else {
                // update
                await documentsDB.updateDocument({
                    databaseId,
                    collectionId,
                    documentId: $id,
                    data: documentWithoutDates,
                    permissions: document.$permissions ?? []
                });

                trackEvent(Submit.DocumentUpdate);
                addNotification({
                    message: 'Document has been updated',
                    type: 'success'
                });
            }

            await invalidate(Dependencies.DOCUMENTS);
            noSqlDocument.update(() => {
                return {
                    isNew: false,
                    show: false,
                    document: {}
                };
            });

            // re-render spreadsheet!
            spreadsheetRenderKey.set(hash(Date.now().toString()));
            const firstDocument = $documents?.documents?.[0];
            if (firstDocument) {
                $noSqlDocument.document = firstDocument;
            }
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DocumentUpdate);
        }
    }

    function getCorrectOrderQuery() {
        return $sortState?.column && $sortState?.direction !== 'default'
            ? $sortState.direction === 'asc'
                ? Query.orderAsc($sortState.column)
                : Query.orderDesc($sortState.column)
            : Query.orderDesc('');
    }

    async function loadPage(pageNumber: number): Promise<boolean> {
        if (pageNumber < 1 || pageNumber > totalPages || $paginatedDocuments.hasPage(pageNumber)) {
            return false;
        }

        const parsedQueries = data.parsedQueries;
        const filterQueries = parsedQueries.size ? data.parsedQueries.values() : [];

        $paginatedDocumentsLoading = true;
        const loadedRows = await sdk
            .forProject(page.params.region, page.params.project)
            .documentsDB.listDocuments({
                databaseId,
                collectionId,
                queries: [
                    getCorrectOrderQuery(),
                    Query.limit(SPREADSHEET_PAGE_LIMIT),
                    Query.offset(pageToOffset(pageNumber, SPREADSHEET_PAGE_LIMIT)),
                    ...filterQueries /* filter queries */,
                    ...buildWildcardEntitiesQuery(collection)
                ]
            });

        paginatedDocuments.setPage(pageNumber, loadedRows.documents);
        $paginatedDocumentsLoading = false;

        return true;
    }

    async function handleGoToPage(targetPageNum: number): Promise<void> {
        jumpToPageReactive = 0;
        if (targetPageNum < 1 || targetPageNum > totalPages) return;

        if (!$paginatedDocuments.hasPage(targetPageNum)) {
            paginatedDocuments.setMaxPage(targetPageNum);
            $paginatedDocumentsLoading = true;

            const loadedRows = await sdk
                .forProject(page.params.region, page.params.project)
                .documentsDB.listDocuments({
                    databaseId,
                    collectionId,
                    queries: [
                        getCorrectOrderQuery(),
                        Query.limit(SPREADSHEET_PAGE_LIMIT),
                        Query.offset(pageToOffset(targetPageNum, SPREADSHEET_PAGE_LIMIT)),
                        ...buildWildcardEntitiesQuery(collection)
                    ]
                });

            paginatedDocuments.setPage(targetPageNum, loadedRows.documents);
            $paginatedDocumentsLoading = false;
        }
    }

    $: emptyCellsCount =
        $paginatedDocuments.virtualLength >= emptyCellsLimit
            ? 0
            : emptyCellsLimit - $paginatedDocuments.virtualLength + (!$expandTabs ? 2 : 0);

    $: canShowDatetimePopover = true;

    $: if ($documents.documents) {
        makeCollectionColumns();
    }

    $: totalPages = Math.ceil($documents.total / SPREADSHEET_PAGE_LIMIT) || 1;

    $: rowSelection =
        !$spreadsheetLoading && !$paginatedDocumentsLoading ? true : ('disabled' as const);
</script>

<SpreadsheetContainer
    bind:this={spreadsheetContainer}
    bind:showEditorSideSheet={$noSqlDocument.show}>
    {#key $spreadsheetRenderKey}
        <Spreadsheet.Root
            height="100%"
            allowSelection
            useVirtualizer
            selection={rowSelection}
            loading={$spreadsheetLoading}
            emptyCells={emptyCellsCount}
            bind:columns={$collectionColumns}
            bind:selectedRows={selectedDocuments}
            rowCount={$paginatedDocuments.virtualLength}
            bottomActionClick={() => {
                // (showDocumentCreateSheet.show = true)
            }}
            bind:currentPage
            nextPageTriggerOffset={2}
            jumpToPageNumber={jumpToPageReactive}
            loadingMore={$paginatedDocumentsLoading}
            itemsPerPage={SPREADSHEET_PAGE_LIMIT}
            loadNextPage={loadPage}
            loadPreviousPage={loadPage}
            goToPage={handleGoToPage}
            bottomActionTooltip={{
                text: 'Create row',
                placement: 'top-end'
            }}>
            <svelte:fragment slot="header" let:root>
                {#each $collectionColumns as column (column.id)}
                    <Spreadsheet.Header.Cell
                        {root}
                        column={column.id}
                        icon={column.icon ?? undefined}>
                        {#if !column.isAction}
                            <Layout.Stack
                                gap="xs"
                                direction="row"
                                alignItems="center"
                                alignContent="center"
                                style="min-width: 0;">
                                <Typography.Text truncate>
                                    {column.title}
                                </Typography.Text>

                                <SortButton onSort={sort} column={column.id} state={sortState} />
                            </Layout.Stack>
                        {/if}
                    </Spreadsheet.Header.Cell>
                {/each}
            </svelte:fragment>

            <svelte:fragment slot="rows" let:root let:item let:index>
                {@const document = $paginatedDocuments.getItemAtVirtualIndex(index)}
                {#if document === null}
                    <Spreadsheet.Row.Base
                        {root}
                        {index}
                        virtualItem={item}
                        id={`loading-${index}`}
                        select={rowSelection}>
                        {#each $collectionColumns as col}
                            <Spreadsheet.Cell
                                root={{ ...root, loading: true }}
                                column={col.id}
                                id={`loading-${index}-${col.id}`}
                                isEditable={false} />
                        {/each}
                    </Spreadsheet.Row.Base>
                {:else}
                    <button
                        onclick={() => {
                            $noSqlDocument.show = true;
                            $noSqlDocument.isNew = false;
                            $noSqlDocument.document = document;
                        }}
                        style:cursor="pointer">
                        <Spreadsheet.Row.Base
                            {root}
                            {index}
                            id={document?.$id}
                            virtualItem={item}
                            select={rowSelection}
                            isSelected={$noSqlDocument?.document?.['$id'] === document.$id}>
                            {#each $collectionColumns as { id: columnId } (columnId)}
                                <Spreadsheet.Cell {root} isEditable={false} column={columnId}>
                                    {#if columnId === '$id'}
                                        <Id value={document.$id} tooltipPortal tooltipDelay={200}
                                            >{document.$id}</Id>
                                    {:else if columnId === '$createdAt' || columnId === '$updatedAt'}
                                        <DualTimeView
                                            showDatetime
                                            time={document[columnId]}
                                            canShowPopover={canShowDatetimePopover} />
                                    {:else if columnId === 'actions'}
                                        <SpreadsheetOptions
                                            type="row"
                                            onSelect={(option) => {
                                                onSelectSheetOption(option, document);
                                            }}
                                            onVisibilityChanged={(visible) => {
                                                canShowDatetimePopover = !visible;
                                            }}>
                                            {#snippet children(toggle)}
                                                <Button.Button
                                                    icon
                                                    variant="extra-compact"
                                                    on:click={toggle}>
                                                    <Icon
                                                        icon={IconDotsHorizontal}
                                                        color="--fgcolor-neutral-primary" />
                                                </Button.Button>
                                            {/snippet}
                                        </SpreadsheetOptions>
                                    {/if}
                                </Spreadsheet.Cell>
                            {/each}
                        </Spreadsheet.Row.Base>
                    </button>
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="footer">
                <Layout.Stack
                    direction="row"
                    alignContent="center"
                    alignItems="center"
                    justifyContent="space-between">
                    <Layout.Stack
                        gap="l"
                        direction="row"
                        alignItems="center"
                        alignContent="center"
                        inline>
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                            <span style:white-space="nowrap">
                                {selectedDocuments.length
                                    ? `${selectedDocuments.length} document${selectedDocuments.length === 1 ? '' : 's'} selected`
                                    : `${formatNumberWithCommas($documents.total)} document${$documents.total === 1 ? '' : 's'}`}
                            </span>
                        </Typography.Text>

                        <div
                            style:height="20px"
                            style:width="1px"
                            style:background-color="var(--border-neutral)">
                        </div>

                        <Layout.Stack
                            gap="xs"
                            direction="row"
                            alignItems="center"
                            alignContent="center">
                            <span style:white-space="nowrap"> Page </span>

                            <InputSelect
                                id="pagination"
                                value={currentPage}
                                placeholder="Page"
                                options={Array.from({ length: totalPages }, (_, i) => ({
                                    label: `${i + 1}`,
                                    value: i + 1
                                }))}
                                on:change={(e) => (jumpToPageReactive = Number(e.detail))} />

                            <span style:white-space="nowrap">
                                out of {totalPages}
                            </span>
                        </Layout.Stack>
                    </Layout.Stack>

                    {#if !$isSmallViewport}
                        <div style:margin-right="var(--space-6)">
                            <Button.Button
                                size="xs"
                                variant="secondary"
                                on:click={() => {
                                    $randomDataModalState.show = true;
                                }}>Generate sample data</Button.Button>
                        </div>
                    {/if}
                </Layout.Stack>
            </svelte:fragment>
        </Spreadsheet.Root>
    {/key}

    {#snippet noSqlEditor()}
        <NoSqlEditor
            ctrlSave
            isNew={$noSqlDocument.isNew}
            loading={$noSqlDocument.loading}
            bind:data={$noSqlDocument.document}
            onSave={async (document) => await createOrUpdateDocument(document)} />
    {/snippet}

    {#if selectedDocuments.length > 0}
        <div class="floating-action-bar">
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <div style:width="max-content">
                        <Layout.Stack direction="row" alignItems="center" gap="m">
                            <Badge content={selectedDocuments.length.toString()} />
                            <span style:font-size="14px">
                                {selectedDocuments.length > 1 ? 'documents' : 'document'}
                                selected
                            </span>
                        </Layout.Stack>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <ConsoleButton text on:click={() => (selectedDocuments = [])}
                        >Cancel</ConsoleButton>
                    <ConsoleButton secondary on:click={() => (showDelete = true)}
                        >Delete</ConsoleButton>
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {/if}
</SpreadsheetContainer>

<Confirm
    confirmDeletion
    bind:open={showDelete}
    onSubmit={handleDelete}
    title={selectedDocuments.length === 1 ? 'Delete document' : 'Delete documents'}>
    {@const isSingle = selectedDocumentForDelete !== null}

    <p>
        {#if isSingle}
            Are you sure you want to delete this row from <b>{collection.name}</b>?
        {:else}
            Are you sure you want to delete <b>{selectedDocuments.length}</b>
            {selectedDocuments.length > 1 ? 'documents' : 'document'} from <b>{collection.name}</b>?
        {/if}
    </p>

    <p class="u-bold">This action is irreversible.</p>
</Confirm>

<style lang="scss">
    .floating-action-bar {
        left: 50%;
        bottom: 0;
        width: 100%;
        z-index: 14;
        position: absolute;
        transform: translateX(-50%);
    }

    // very weird because the library already has this!
    :global(.virtual-row:has([data-editing-mode='true'])) {
        z-index: 1 !important;
    }

    :global(.floating-editor) {
        z-index: 3 !important;

        & :global(:has(textarea)) {
            left: 2px !important;
            //margin-inline-end: 1px;
        }

        & :global(textarea) {
            padding-inline: 9px;
            margin-block: -2.75px;
            min-height: 85px !important;
        }

        & :global(:has(.link-wrapper) .input) {
            padding-bottom: 6px !important;
        }

        & :global(:has(.link-wrapper) textarea) {
            min-height: 65px !important;
        }

        & :global(.link-wrapper) {
            padding-inline: 9px;
        }

        & :global(input[type='text']) {
            padding-inline: 8px !important;
        }

        & :global(.input:has([type^='date'])) {
            padding: 12px !important;
        }

        & :global(.input:focus-within) {
            top: 0 !important;
        }
    }
</style>
