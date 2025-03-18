<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, FloatingActionBar, Id, Modal } from '$lib/components';
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
    import { Tooltip, Table, Selector, Button, Link } from '@appwrite.io/pink-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

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

    $: relAttributes = $attributes?.filter((attribute) =>
        isRelationship(attribute)
    ) as Models.AttributeRelationship[];

    let checked = false;
</script>

<Table.Root>
    <svelte:fragment slot="header">
        <Table.Header.Selector width="40px" />
        <Table.Header.Cell width="150px">Document ID</Table.Header.Cell>
        {#each $columns.filter((n) => n.show) as column}
            {#if column.show}
                <Table.Header.Cell>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
        <Table.Header.Cell>Created</Table.Header.Cell>
        <Table.Header.Cell>Updated</Table.Header.Cell>
    </svelte:fragment>
    {#each data.documents.documents as document}
        <Table.Link
            href={`${base}/project-${projectId}/databases/database-${databaseId}/collection-${$collection.$id}/document-${document.$id}`}>
            <Table.Cell>
                <Selector.Checkbox size="s" />
            </Table.Cell>
            <Table.Cell width="150px">
                {#key document.$id}
                    <Id value={document.$id}>
                        {document.$id}
                    </Id>
                {/key}
            </Table.Cell>

            {#each $columns as column}
                {#if column.show}
                    {@const attr = $attributes.find((n) => n.key === column.id)}
                    {#if isRelationship(attr)}
                        {@const args = displayNames?.[attr.relatedCollection] ?? ['$id']}
                        <Table.Cell>
                            {#if !isRelationshipToMany(attr)}
                                {#if document[column.id]}
                                    {@const related = document[column.id]}
                                    <Link.Button
                                        variant="muted"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            goto(
                                                `${base}/project-${projectId}/databases/database-${databaseId}/collection-${attr.relatedCollection}/document-${related.$id}`
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
                                {@const itemsNum = document[column.id]?.length}
                                <Button.Button
                                    variant="extra-compact"
                                    disabled={!itemsNum}
                                    badge={itemsNum ?? 0}
                                    on:click={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        relationshipData = document[column.id];
                                        showRelationships = true;
                                        selectedRelationship = attr;
                                    }}>
                                    Items
                                </Button.Button>
                            {/if}
                        </Table.Cell>
                    {:else}
                        {@const formatted = formatColumn(document[column.id])}
                        <Table.Cell>
                            <Tooltip disabled={!formatted.truncated} placement="bottom">
                                <span>
                                    {formatted.value}
                                </span>
                                <span style:white-space="pre-wrap" slot="tooltip">
                                    {formatted.whole}
                                </span>
                            </Tooltip>
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
            <Table.Cell>
                <DualTimeView time={document.$createdAt} />
            </Table.Cell>
            <Table.Cell>
                <DualTimeView time={document.$updatedAt} />
            </Table.Cell>
        </Table.Link>
    {/each}
</Table.Root>

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
            <ConsoleButton text on:click={() => (selectedDb = [])}>Cancel</ConsoleButton>
            <ConsoleButton secondary on:click={() => (showDelete = true)}>
                <p>Delete</p>
            </ConsoleButton>
        </div>
    </div>
</FloatingActionBar>

<Modal
    title="Delete Documents"
    bind:show={showDelete}
    onSubmit={handleDelete}
    dismissible={!deleting}>
    <div>
        <p class="text" data-private>
            Are you sure you want to delete <b>{selectedDb.length}</b>
            {selectedDb.length > 1 ? 'documents' : 'document'}?
        </p>

        {#if relAttributes?.length}
            <Table.Root>
                <svelte:fragment slot="header">
                    <Table.Header.Cell width="50px">Relation</Table.Header.Cell>
                    <Table.Header.Cell width="50px">Setting</Table.Header.Cell>
                    <Table.Header.Cell />
                </svelte:fragment>
                {#each relAttributes as attr}
                    <Table.Row>
                        <Table.Cell>
                            <span class="u-flex u-cross-center u-gap-8">
                                {#if attr.twoWay}
                                    <span class="icon-switch-horizontal" />
                                {:else}
                                    <span class="icon-arrow-sm-right" />
                                {/if}
                                <span data-private>{attr.key}</span>
                            </span>
                        </Table.Cell>
                        <Table.Cell>
                            {attr.onDelete}
                        </Table.Cell>
                        <Table.Cell>
                            {Deletion[attr.onDelete]}
                        </Table.Cell>
                    </Table.Row>
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

    <svelte:fragment slot="footer">
        <ConsoleButton text on:click={() => (showDelete = false)} disabled={deleting}
            >Cancel</ConsoleButton>
        <ConsoleButton secondary submit disabled={deleting || (relAttributes?.length && !checked)}>
            Delete
        </ConsoleButton>
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
