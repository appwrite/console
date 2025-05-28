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
    import type { Models } from '@appwrite.io/console';
    import { afterUpdate, onMount } from 'svelte';
    import type { PageData } from './$types';
    import { isRelationship, isRelationshipToMany } from './document-[document]/attributes/store';
    import RelationshipsModal from './relationshipsModal.svelte';
    import { attributes, collection, columns } from './store';
    import type { ColumnType } from '$lib/helpers/types';
    import {
        Tooltip,
        Table,
        Button,
        Link,
        Badge,
        FloatingActionBar,
        Typography
    } from '@appwrite.io/pink-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let data: PageData;

    const databaseId = page.params.database;
    const collectionId = page.params.collection;
    let showRelationships = false;
    let selectedRelationship: Models.AttributeRelationship = null;
    let relationshipData: Partial<Models.Document>[];
    let displayNames = {};

    onMount(async () => {
        displayNames = preferences.getDisplayNames();
        updateMaxWidth();
    });

    afterUpdate(() => updateMaxWidth());

    function updateMaxWidth() {
        const tableCells = Array.from(document.querySelectorAll('.less-width-truncated'));

        const visibleColumnsCount = $columns.filter((col) => !col.hide).length;
        const newMaxWidth = Math.max(50 - (visibleColumnsCount - 1) * 5, 25);

        tableCells.forEach((cell) => {
            const cellItem = cell as HTMLElement;
            cellItem.style.maxWidth = `${newMaxWidth}vw`;
        });
    }

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
            whole: formattedColumn
        };
    }

    $: selected = preferences.getCustomCollectionColumns(page.params.collection);

    $: {
        columns.set(
            $collection.attributes.map((attribute) => ({
                id: attribute.key,
                title: attribute.key,
                type: attribute.type as ColumnType,
                show: selected?.includes(attribute.key) ?? true,
                array: attribute?.array,
                width: { min: 168 },
                format:
                    'format' in attribute && attribute?.format === 'enum' ? attribute.format : null,
                elements: 'elements' in attribute ? attribute.elements : null
            }))
        );
    }

    let selectedRows: string[] = [];
    let showDelete = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedRows.map((documentId) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .databases.deleteDocument(databaseId, collectionId, documentId)
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.DocumentDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length} document${selectedRows.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.DOCUMENTS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DocumentDelete);
        } finally {
            selectedRows = [];
            showDelete = false;
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
</script>

<Table.Root
    let:root
    allowSelection
    bind:selectedRows
    columns={[
        { id: '$id', width: 200 },
        ...$columns,
        { id: '$created', width: 200 },
        { id: '$updated', width: 200 }
    ]}>
    <svelte:fragment slot="header" let:root>
        <Table.Header.Cell column="$id" {root}>Document ID</Table.Header.Cell>
        {#each $columns as column}
            <Table.Header.Cell column={column.id} {root}>{column.title}</Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="$created" {root}>Created</Table.Header.Cell>
        <Table.Header.Cell column="$updated" {root}>Updated</Table.Header.Cell>
    </svelte:fragment>
    {#each data.documents.documents as document (document.$id)}
        <Table.Row.Link
            {root}
            id={document.$id}
            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/collection-${$collection.$id}/document-${document.$id}`}>
            <Table.Cell column="$id" {root}>
                {#key document.$id}
                    <Id value={document.$id}>
                        {document.$id}
                    </Id>
                {/key}
            </Table.Cell>

            {#each $columns as { id }}
                {@const attr = $attributes.find((n) => n.key === id)}
                <Table.Cell column={id} {root}>
                    {#if isRelationship(attr)}
                        {@const args = displayNames?.[attr.relatedCollection] ?? ['name']}
                        {#if !isRelationshipToMany(attr)}
                            {#if document[id]}
                                {@const related = document[id]}
                                <Link.Button
                                    variant="muted"
                                    on:click={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        goto(
                                            `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/collection-${attr.relatedCollection}/document-${related.$id}`
                                        );
                                    }}>
                                    {#each args as arg, i}
                                        {#if arg !== undefined}
                                            {#if i}
                                                &nbsp;|
                                            {/if}
                                            <span class="text" data-private>
                                                {related?.[arg]}
                                            </span>
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
                        {@const formatted = formatColumn(document[id])}
                        <Tooltip disabled={!formatted.truncated} placement="bottom">
                            <Typography.Text truncate>
                                {formatted.value}
                            </Typography.Text>
                            <span
                                style:white-space="pre-wrap"
                                style:word-break="break-all"
                                slot="tooltip">
                                {formatted.whole}
                            </span>
                        </Tooltip>
                    {/if}
                </Table.Cell>
            {/each}
            <Table.Cell column="$created" {root}>
                <DualTimeView time={document.$createdAt} />
            </Table.Cell>
            <Table.Cell column="$updated" {root}>
                <DualTimeView time={document.$updatedAt} />
            </Table.Cell>
        </Table.Row.Link>
    {/each}
</Table.Root>

<RelationshipsModal bind:show={showRelationships} {selectedRelationship} data={relationshipData} />

{#if selectedRows.length > 0}
    <div class="floating-action-bar">
        <FloatingActionBar>
            <svelte:fragment slot="start">
                <Badge content={selectedRows.length.toString()} />
                <span>
                    {selectedRows.length > 1 ? 'documents' : 'document'}
                    selected
                </span>
            </svelte:fragment>
            <svelte:fragment slot="end">
                <ConsoleButton text on:click={() => (selectedRows = [])}>Cancel</ConsoleButton>
                <ConsoleButton secondary on:click={() => (showDelete = true)}>Delete</ConsoleButton>
            </svelte:fragment>
        </FloatingActionBar>
    </div>
{/if}

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

<style>
    .floating-action-bar :global(div:first-of-type) {
        /* 50% > 60% because we have sub-navigation */
        left: calc(60% - var(--p-floating-action-bar-width) / 2);
    }
</style>
