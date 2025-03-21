<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import { Alert, FloatingActionBar, Id, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputChoice } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellCheck,
        TableCellHead,
        TableCellHeadCheck,
        TableCellText,
        TableHeader,
        TableRow,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { addNotification } from '$lib/stores/notifications';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { afterUpdate, onMount } from 'svelte';
    import type { PageData } from './$types';
    import { isRelationship, isRelationshipToMany } from './document-[document]/attributes/store';
    import RelationshipsModal from './relationshipsModal.svelte';
    import { attributes, collection, columns } from './store';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import type { ColumnType } from '$lib/helpers/types';
    import { toLocaleDateTime } from '$lib/helpers/date';

    export let data: PageData;

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    let showRelationships = false;
    let selectedRelationship: Models.AttributeRelationship = null;
    let relationshipData: [];
    let displayNames = {};

    onMount(async () => {
        displayNames = preferences.getDisplayNames();
        updateMaxWidth();
    });

    afterUpdate(() => updateMaxWidth());

    function updateMaxWidth() {
        const tableCells = Array.from(document.querySelectorAll('.less-width-truncated'));

        const visibleColumnsCount = $columns.filter((col) => col.show).length;
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

    $: selected = preferences.getCustomCollectionColumns($page.params.collection);

    $: {
        columns.set(
            $collection.attributes.map((attribute) => ({
                id: attribute.key,
                title: attribute.key,
                type: attribute.type as ColumnType,
                show: selected?.includes(attribute.key) ?? true,
                array: attribute?.array,
                format:
                    'format' in attribute && attribute?.format === 'enum' ? attribute.format : null,
                elements: 'elements' in attribute ? attribute.elements : null
            }))
        );
    }

    let selectedDb: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedDb.map((documentId) =>
            sdk.forProject.databases.deleteDocument(databaseId, collectionId, documentId)
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.DocumentDelete);
            addNotification({
                type: 'success',
                message: `${selectedDb.length} document${selectedDb.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.DOCUMENTS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DocumentDelete);
        } finally {
            selectedDb = [];
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

<TableScroll isSticky>
    <TableHeader>
        <TableCellHeadCheck
            bind:selected={selectedDb}
            pageItemsIds={data.documents.documents.map((d) => d.$id)} />
        <TableCellHead width={150} eyebrow={false}>Document ID</TableCellHead>
        {#each $columns.filter((n) => n.show) as column}
            {#if column.show}
                <TableCellHead eyebrow={false}>{column.title}</TableCellHead>
            {/if}
        {/each}
        <TableCellHead eyebrow={false}>Created</TableCellHead>
        <TableCellHead eyebrow={false}>Updated</TableCellHead>
    </TableHeader>
    <TableBody>
        {#each data.documents.documents as document}
            <TableRowLink
                href={`${base}/project-${projectId}/databases/database-${databaseId}/collection-${$collection.$id}/document-${document.$id}`}>
                <TableCellCheck bind:selectedIds={selectedDb} id={document.$id} />

                <TableCell width={150}>
                    {#key document.$id}
                        <Id value={document.$id}>
                            {document.$id}
                        </Id>
                    {/key}
                </TableCell>

                {#each $columns as column}
                    {#if column.show}
                        {@const attr = $attributes.find((n) => n.key === column.id)}
                        {#if isRelationship(attr)}
                            {@const args = displayNames?.[attr.relatedCollection] ?? ['$id']}
                            <TableCell title={column.title}>
                                {#if !isRelationshipToMany(attr)}
                                    {#if document[column.id]}
                                        {@const related = document[column.id]}
                                        <div
                                            tabindex="0"
                                            class="link is-5px-offset u-trim-1 u-break-word"
                                            role="button"
                                            on:keyup={clickOnEnter}
                                            on:click|preventDefault|stopPropagation={() =>
                                                goto(
                                                    `${base}/project-${projectId}/databases/database-${databaseId}/collection-${attr.relatedCollection}/document-${related.$id}`
                                                )}>
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
                                        </div>
                                    {:else}
                                        <span class="text">n/a</span>
                                    {/if}
                                {:else}
                                    {@const itemsNum = document[column.id]?.length}
                                    <button
                                        class="button is-text"
                                        on:click|preventDefault|stopPropagation={() => {
                                            relationshipData = document[column.id];
                                            showRelationships = true;
                                            selectedRelationship = attr;
                                        }}
                                        disabled={!itemsNum}>
                                        Items <span class="inline-tag">{itemsNum ?? 0}</span>
                                    </button>
                                {/if}
                            </TableCell>
                        {:else}
                            {@const formatted = formatColumn(document[column.id])}
                            <TableCell class="truncated-content-table-cell">
                                <div
                                    class:truncated={formatted.whole.length >
                                        formatted.value.length}
                                    class:less-width-truncated={$columns.filter((col) => col.show)
                                        .length > 1}
                                    use:tooltip={{
                                        content: formatted.whole,
                                        disabled: !formatted.truncated
                                    }}
                                    data-private
                                    data-content={formatted.whole}>
                                    {formatted.whole}
                                </div>
                            </TableCell>
                        {/if}
                    {/if}
                {/each}
                <TableCellText>
                    {toLocaleDateTime(document.$createdAt)}
                </TableCellText>
                <TableCellText>
                    {toLocaleDateTime(document.$updatedAt)}
                </TableCellText>
            </TableRowLink>
        {/each}
    </TableBody>
</TableScroll>

<RelationshipsModal bind:show={showRelationships} {selectedRelationship} data={relationshipData} />

<FloatingActionBar show={selectedDb.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selectedDb.length}</span>
            <p>
                <span class="is-only-desktop">
                    {selectedDb.length > 1 ? 'documents' : 'document'}
                </span>
                selected
            </p>
        </div>

        <div class="u-flex u-cross-center u-gap-8">
            <Button text on:click={() => (selectedDb = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>
                <p>Delete</p>
            </Button>
        </div>
    </div>
</FloatingActionBar>

<Modal
    title="Delete Documents"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <div>
        <p class="text" data-private>
            Are you sure you want to delete <b>{selectedDb.length}</b>
            {selectedDb.length > 1 ? 'documents' : 'document'}?
        </p>

        {#if relAttributes?.length}
            <TableScroll noMargin>
                <TableHeader>
                    <TableCellHead width={50}>Relation</TableCellHead>
                    <TableCellHead width={50}>Setting</TableCellHead>
                    <TableCellHead width={200} />
                </TableHeader>
                <TableBody>
                    {#each relAttributes as attr}
                        <TableRow>
                            <TableCell title="relation">
                                <span class="u-flex u-cross-center u-gap-8">
                                    {#if attr.twoWay}
                                        <span class="icon-switch-horizontal" />
                                    {:else}
                                        <span class="icon-arrow-sm-right" />
                                    {/if}
                                    <span data-private>{attr.key}</span>
                                </span>
                            </TableCell>
                            <TableCellText title="Settings">
                                {attr.onDelete}
                            </TableCellText>
                            <TableCellText title="description">
                                {Deletion[attr.onDelete]}
                            </TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </TableScroll>
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

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting || (relAttributes?.length && !checked)}>
            Delete
        </Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    .actions {
        .indicator {
            border-radius: 0.25rem;
            background: hsl(var(--color-information-100));
            color: hsl(var(--color-neutral-0));

            padding: 0rem 0.375rem;
            display: inline-block;
        }
    }

    :global(.truncated-content-table-cell .truncated) {
        max-width: 50vw;
        overflow: hidden;
        white-space: nowrap;
        display: inline-block;
        text-overflow: ellipsis;
    }

    :global(.truncated-content-table-cell:has(.truncated)) {
        inline-size: 0;
    }
</style>
