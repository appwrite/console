<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, Confirm, Id } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button as ConsoleButton, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { type Models, Query } from '@appwrite.io/console';
    import { type ComponentType, onMount } from 'svelte';
    import type { PageData } from './$types';
    import {
        isRelationship,
        isRelationshipToMany,
        isString
    } from './document-[document]/attributes/store';
    import { attributes, collection, columns, databaseSheetOptions } from './store';
    import RelationshipsModal from './relationshipsModal.svelte';
    import type { SheetColumn, SheetColumnType } from '$lib/helpers/types';
    import {
        Tooltip,
        Spreadsheet,
        Table,
        Button,
        Layout,
        Link,
        Badge,
        FloatingActionBar,
        Icon,
        InteractiveText,
        Typography,
        Sheet,
        Divider
    } from '@appwrite.io/pink-svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import {
        IconCalendar,
        IconDotsHorizontal,
        IconPlus,
        IconRelationship,
        IconFingerPrint,
        IconHashtag,
        IconLink,
        IconLocationMarker,
        IconMail,
        IconText,
        IconToggle,
        IconViewList,
        IconSelector,
        IconChevronUp,
        IconChevronDown
    } from '@appwrite.io/pink-icons-svelte';
    import SheetOptions from './sheetOptions.svelte';
    import { type Action } from './sheetOptions.svelte';
    import EditAttribute from './attributes/edit.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    export let data: PageData;

    const databaseId = page.params.database;
    const collectionId = page.params.collection;

    let displayNames = {};
    let showRelationships = false;
    let selectedRelationship: Models.AttributeRelationship = null;
    let relationshipData: Partial<Models.Document>[];

    let spreadsheetHeight = '75vh';
    let spreadsheetWrapper: HTMLDivElement;

    $: documents = data.documents;

    function resizeSheet() {
        if (!spreadsheetWrapper) return;
        const rect = spreadsheetWrapper.getBoundingClientRect();
        spreadsheetHeight = window.innerHeight - rect.top + 'px';
    }

    onMount(async () => {
        resizeSheet();
        displayNames = preferences.getDisplayNames();
    });

    function formatArray(array: unknown[]) {
        if (array.length === 0) return '[ ]';

        let formattedFields: string[] = [];
        for (const item of array) {
            if (typeof item === 'string') {
                formattedFields.push(`"${item}"`);
            } else {
                formattedFields.push(`${item}`);
            }
        }

        return `[${formattedFields.join(', ')}]`;
    }

    function formatColumn(column: unknown) {
        let formattedColumn: string;

        if (typeof column === 'string') {
            formattedColumn = column;
        } else if (Array.isArray(column)) {
            formattedColumn = formatArray(column);
        } else if (column === null) {
            formattedColumn = 'null';
        } else {
            formattedColumn = `${column}`;
        }

        return {
            value:
                formattedColumn.length > 20
                    ? `${formattedColumn.slice(0, 20)}...`
                    : formattedColumn,
            truncated: formattedColumn.length > 20,
            whole: `${formattedColumn.slice(0, 100)}...`
        };
    }

    function getAppropriateIcon(type: string): ComponentType {
        switch (type) {
            case 'string':
                return IconText;
            case 'float':
            case 'integer':
                return IconHashtag;
            case 'boolean':
                return IconToggle;
            case 'datetime':
                return IconCalendar;
            case 'email':
                return IconMail;
            case 'ip':
                return IconLocationMarker;
            case 'url':
                return IconLink;
            case 'enum':
                return IconViewList;
            case 'relationship':
                return IconRelationship;
        }
    }

    $: selected = preferences.getCustomCollectionColumns(page.params.collection);

    $: {
        const baseColumns = $collection.attributes.map((attribute) => ({
            id: attribute.key,
            title: attribute.key,
            type: attribute.type as SheetColumnType,
            hide: !!selected?.includes(attribute.key),
            array: attribute?.array,
            width: { min: 168 },
            draggable: true,
            icon: getAppropriateIcon(attribute.type),
            format: 'format' in attribute && attribute?.format === 'enum' ? attribute.format : null,
            elements: 'elements' in attribute ? attribute.elements : null
        }));

        const staticColumns: SheetColumn[] = [
            {
                id: '$id',
                title: 'ID',
                width: 200,
                draggable: false,
                type: 'string',
                icon: IconFingerPrint
            },
            {
                id: '$createdAt',
                title: 'createdAt',
                width: { min: 200 },
                draggable: true,
                type: 'datetime',
                icon: IconCalendar
            },
            {
                id: '$updatedAt',
                title: 'updatedAt',
                width: { min: 200 },
                draggable: true,
                type: 'datetime',
                icon: IconCalendar
            },
            {
                id: 'actions',
                title: '',
                width: 40,
                isAction: true,
                draggable: false,
                type: 'string'
            }
        ];

        columns.set([
            staticColumns[0],
            ...baseColumns,
            staticColumns[1],
            staticColumns[2],
            staticColumns[3]
        ]);
    }

    let loading = false;
    let showDelete = false;
    let showColumnDelete = false;
    let selectedRows: string[] = [];

    let sortBy: string | null = null;
    let sortDir: 'asc' | 'desc' | null = null;

    async function sort(columnId: string) {
        loading = true;
        if (sortBy !== columnId) {
            sortBy = columnId;
            sortDir = 'asc';
        } else if (sortDir === 'asc') {
            sortDir = 'desc';
        } else if (sortDir === 'desc') {
            sortBy = null;
            sortDir = null;
        } else {
            sortDir = 'asc';
        }

        let query: string[] = [];
        if (sortBy && sortDir) {
            query = [sortDir === 'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)];
        }

        documents = await sdk
            .forProject(page.params.region, page.params.project)
            .databases.listDocuments(databaseId, collectionId, query);

        loading = false;
    }

    async function handleDelete() {
        showDelete = false;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.deleteDocuments(databaseId, collectionId, [
                    Query.equal('$id', selectedRows)
                ]);

            trackEvent(Submit.DocumentDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length} document${selectedRows.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.DOCUMENTS);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.DocumentDelete);
        } finally {
            selectedRows = [];
            showDelete = false;
        }
    }

    async function handleColumnDelete() {
        showColumnDelete = false;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.deleteAttribute(
                    databaseId,
                    collectionId,
                    $databaseSheetOptions.column.key
                );

            trackEvent(Submit.AttributeDelete);
            addNotification({
                type: 'success',
                message: 'Attribute deleted'
            });
            invalidate(Dependencies.COLLECTION);
            invalidate(Dependencies.DOCUMENTS);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.AttributeDelete);
        } finally {
            showColumnDelete = false;
        }
    }

    enum Deletion {
        'setNull' = 'Set document ID as NULL in all related documents',
        'cascade' = 'All related documents will be deleted',
        'restrict' = 'Document can not be deleted'
    }

    $: relAttributes = $attributes?.filter(
        (attribute) =>
            isRelationship(attribute) &&
            // One-to-One are always included
            (attribute.relationType === 'oneToOne' ||
                // One-to-Many: Only if parent is deleted
                (attribute.relationType === 'oneToMany' && attribute.side === 'parent') ||
                // Many-to-One: Only include if child is deleted
                (attribute.relationType === 'manyToOne' && attribute.side === 'child') ||
                // Many-to-Many: Only include if the parent is being deleted
                (isRelationshipToMany(attribute) && attribute.side === 'parent'))
    ) as Models.AttributeRelationship[];

    let checked = false;

    function onSelectSheetOption(type: Action) {
        if (type === 'update') {
            $databaseSheetOptions.show = true;
            $databaseSheetOptions.isEdit = true;
            $databaseSheetOptions.title = 'update column';
        }

        if (type === 'column-left' || type === 'column-right') {
            $databaseSheetOptions.show = true;
            $databaseSheetOptions.title = 'New column';
        }

        if (type === 'delete') {
            showColumnDelete = true;
        }

        $databaseSheetOptions.column = null;
    }

    const emptyCellsLimit = $isSmallViewport ? 12 : 18;

    $: emptyCellsCount =
        data.documents.documents.length >= emptyCellsLimit
            ? 0
            : emptyCellsLimit - data.documents.documents.length;
</script>

<svelte:window on:resize={resizeSheet} />

<div
    bind:this={spreadsheetWrapper}
    style:height={spreadsheetHeight}
    style:position="relative"
    style:width="100%">
    <Spreadsheet.Root
        let:root
        {loading}
        height="100%"
        allowSelection
        bind:selectedRows
        bind:columns={$columns}
        emptyCells={emptyCellsCount}
        bottomActionClick={() => {
            // do something
        }}>
        <svelte:fragment slot="header" let:root>
            {#each $columns as column (column.id)}
                {#if column.isAction}
                    <Spreadsheet.Header.Cell column="actions" {root}>
                        <Button.Button icon variant="extra-compact" on:click={() => {}}>
                            <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                        </Button.Button>
                    </Spreadsheet.Header.Cell>
                {:else}
                    <SheetOptions
                        column={$attributes.find((attr) => attr.key === column.id)}
                        onSelect={onSelectSheetOption}>
                        {#snippet children(toggle)}
                            <Spreadsheet.Header.Cell
                                {root}
                                column={column.id}
                                icon={column.icon ?? IconText}
                                on:contextmenu={toggle}>
                                <Layout.Stack
                                    gap="xxxs"
                                    direction="row"
                                    alignItems="center"
                                    alignContent="center">
                                    {column.title}
                                    <Button.Button
                                        icon
                                        variant="extra-compact"
                                        on:click={() => sort(column.id)}>
                                        <Icon
                                            size="s"
                                            icon={sortBy === column.id
                                                ? sortDir === 'asc'
                                                    ? IconChevronUp
                                                    : IconChevronDown
                                                : IconSelector} />
                                    </Button.Button>
                                </Layout.Stack>
                            </Spreadsheet.Header.Cell>
                        {/snippet}
                    </SheetOptions>
                {/if}
            {/each}
        </svelte:fragment>

        {#each documents.documents as document (document.$id)}
            <!-- TODO: add `value` for user attributes -->
            <Spreadsheet.Row.Base {root} id={document.$id}>
                {#each $columns as { id } (id)}
                    {@const formatted = formatColumn(document[id])}
                    <Spreadsheet.Cell
                        {root}
                        column={id}
                        value={id.includes('$') || formatted.value === 'null'
                            ? undefined
                            : formatted.value}>
                        {#if id === '$id'}
                            <Id value={document.$id}>{document.$id}</Id>
                        {:else if id === '$createdAt' || id === '$updatedAt'}
                            <DualTimeView time={document[id]} />
                        {:else if id === 'actions'}
                            <Button.Button icon variant="extra-compact">
                                <Icon icon={IconDotsHorizontal} color="--fgcolor-neutral-primary" />
                            </Button.Button>
                        {:else}
                            {@const attr = $attributes.find((n) => n.key === id)}
                            {#if attr}
                                {#if isRelationship(attr)}
                                    {@const args = displayNames?.[attr.relatedCollection] ?? [
                                        '$id'
                                    ]}
                                    {#if !isRelationshipToMany(attr)}
                                        {#if document[id]}
                                            {@const related = document[id]}
                                            <Link.Button
                                                variant="muted"
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    goto(
                                                        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/collection/${attr.relatedCollection}/document/${related.$id}`
                                                    );
                                                }}>
                                                {#each args as arg, i}
                                                    {#if arg !== undefined}
                                                        {#if i}&nbsp;|{/if}
                                                        <span class="text" data-private
                                                            >{related?.[arg]}</span>
                                                    {/if}
                                                {/each}
                                            </Link.Button>
                                        {:else}
                                            <span class="text">n/a</span>
                                        {/if}
                                    {:else}
                                        {@const itemsNum = document[id]?.length}
                                        <Button.Button
                                            variant="extra-compact"
                                            disabled={!itemsNum}
                                            badge={itemsNum ?? 0}
                                            on:click={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                relationshipData = document[id];
                                                showRelationships = true;
                                                selectedRelationship = attr;
                                            }}>
                                            Items
                                        </Button.Button>
                                    {/if}
                                {:else}
                                    {@const value = document[id]}
                                    {@const formatted = formatColumn(document[id])}
                                    {@const isDatetimeAttribute = attr.type === 'datetime'}
                                    {@const isEncryptedAttribute = isString(attr) && attr.encrypt}
                                    {#if isDatetimeAttribute}
                                        <DualTimeView time={value}>
                                            <span slot="title">Timestamp</span>
                                            {toLocaleDateTime(value, true)}
                                        </DualTimeView>
                                    {:else if isEncryptedAttribute}
                                        <button on:click={(e) => e.preventDefault()}>
                                            <InteractiveText
                                                copy={false}
                                                variant="secret"
                                                isVisible={false}
                                                text={formatted.value} />
                                        </button>
                                    {:else if formatted.truncated}
                                        <Tooltip placement="bottom" disabled={!formatted.truncated}>
                                            <Typography.Text truncate
                                                >{formatted.value}</Typography.Text>
                                            <span
                                                let:showing
                                                slot="tooltip"
                                                style:white-space="pre-wrap"
                                                style:word-break="break-all">
                                                {#if showing}
                                                    {formatted.whole}
                                                {/if}
                                            </span>
                                        </Tooltip>
                                    {:else if formatted.value === 'null'}
                                        <Badge variant="secondary" content="NULL" size="xs" />
                                    {:else}
                                        <Typography.Text truncate
                                            >{formatted.value}</Typography.Text>
                                    {/if}
                                {/if}
                            {/if}
                        {/if}
                    </Spreadsheet.Cell>
                {/each}
            </Spreadsheet.Row.Base>
        {/each}

        <svelte:fragment slot="footer">
            <Layout.Stack
                direction="row"
                alignContent="center"
                alignItems="center"
                justifyContent="space-between">
                <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                    {selectedRows.length
                        ? `${selectedRows.length} records selected`
                        : `${documents.documents.length} records`}
                </Typography.Text>

                <div style:margin-right="var(--space-6)">
                    <Button.Button variant="extra-compact">Generate random data</Button.Button>
                </div>
            </Layout.Stack>
        </svelte:fragment>
    </Spreadsheet.Root>

    {#if selectedRows.length > 0}
        <div class="floating-action-bar">
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <div style:width="max-content">
                        <Layout.Stack direction="row" alignItems="center" gap="m">
                            <Badge content={selectedRows.length.toString()} />
                            <span style:font-size="14px">
                                {selectedRows.length > 1 ? 'documents' : 'document'}
                                selected
                            </span>
                        </Layout.Stack>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <ConsoleButton text on:click={() => (selectedRows = [])}>Cancel</ConsoleButton>
                    <ConsoleButton secondary on:click={() => (showDelete = true)}
                        >Delete</ConsoleButton>
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {/if}
</div>

<RelationshipsModal bind:show={showRelationships} {selectedRelationship} data={relationshipData} />

<Confirm title="Delete Documents" bind:open={showDelete} onSubmit={handleDelete}>
    <div>
        Are you sure you want to delete <b>{selectedRows.length}</b>
        {selectedRows.length > 1 ? 'documents' : 'document'}?

        {#if relAttributes?.length}
            <Table.Root
                let:root
                columns={[
                    { id: 'relation', width: 150 },
                    { id: 'setting', width: 150 },
                    { id: 'desc' }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="relation" {root}>Relation</Table.Header.Cell>
                    <Table.Header.Cell column="setting" {root}>Setting</Table.Header.Cell>
                    <Table.Header.Cell column="desc" {root} />
                </svelte:fragment>
                {#each relAttributes as attr}
                    <Table.Row.Base {root}>
                        <Table.Cell column="relation" {root}>
                            <span class="u-flex u-cross-center u-gap-8">
                                {#if attr.twoWay}
                                    <span class="icon-switch-horizontal"></span>
                                {:else}
                                    <span class="icon-arrow-sm-right"></span>
                                {/if}
                                <span data-private>{attr.key}</span>
                            </span>
                        </Table.Cell>
                        <Table.Cell column="setting" {root}>
                            {attr.onDelete}
                        </Table.Cell>
                        <Table.Cell column="desc" {root}>
                            {Deletion[attr.onDelete]}
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
            <div class="u-flex u-flex-vertical u-gap-16">
                <Alert>To change the selection edit the relationship settings.</Alert>

                <ul>
                    <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                        Delete document from <span data-private>{$collection.name}</span>
                    </InputChoice>
                </ul>
            </div>
        {:else}
            <p class="u-bold">This action is irreversible.</p>
        {/if}
    </div>
</Confirm>

<Confirm
    title="Delete column"
    bind:open={showColumnDelete}
    onSubmit={handleColumnDelete}
    confirmDeletion>
    <p>Are you sure you want to delete "<b>{$databaseSheetOptions.column.key}</b>"?</p>

    <p>
        This will permanently remove all data stored in this column across all records. This action
        is irreversible.
    </p>
</Confirm>

<div style="position: absolute; top: 0; ">
    <Sheet bind:open={$databaseSheetOptions.show} closeOnBlur={false}>
        <div slot="header" style:width="100%">
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Layout.Stack direction="row" gap="m" alignItems="center">
                    <Typography.Text variant="m-400">{$databaseSheetOptions.title}</Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
        </div>

        <Layout.Stack direction="column" justifyContent="space-evenly">
            <Layout.Stack gap="xl">
                <EditAttribute
                    isModal={false}
                    showEdit={$databaseSheetOptions.isEdit}
                    selectedAttribute={$databaseSheetOptions.column} />
            </Layout.Stack>

            <div class="sheet-footer">
                <Layout.Stack gap="l">
                    <Divider />

                    <div class="sheet-footer-actions">
                        <Layout.Stack gap="m" direction="row" justifyContent="flex-end">
                            <Button.Button
                                size="s"
                                variant="secondary"
                                on:click={() => ($databaseSheetOptions.show = false)}
                                >Cancel</Button.Button>

                            <Button.Button
                                size="s"
                                disabled={$databaseSheetOptions.disableSubmit}
                                on:click={() => $databaseSheetOptions.submitAction()}>
                                Update
                            </Button.Button>
                        </Layout.Stack>
                    </div>
                </Layout.Stack>
            </div>
        </Layout.Stack>
    </Sheet>
</div>

<style lang="scss">
    .floating-action-bar {
        left: 50%;
        width: 100%;
        z-index: 14;
        position: absolute;
        transform: translateX(-50%);
    }

    .sheet-footer {
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;

        & .sheet-footer-actions {
            padding: var(--space-8);
        }
    }
</style>
