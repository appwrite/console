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
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { isRelationship, isRelationshipToMany, isString } from './row-[row]/columns/store';
    import RelationshipsModal from './relationshipsModal.svelte';
    import { columns, table, tableColumns } from './store';
    import type { ColumnType } from '$lib/helpers/types';
    import {
        Tooltip,
        Table,
        Button,
        Link,
        Badge,
        FloatingActionBar,
        InteractiveText,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let data: PageData;

    const databaseId = page.params.database;
    const tableId = page.params.table;

    let displayNames = {};
    let showRelationships = false;
    let selectedRelationship: Models.ColumnRelationship = null;
    let relationshipData: Partial<Models.Row>[];

    onMount(async () => {
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

    $: selected = preferences.getCustomTableColumns(page.params.table);

    $: {
        tableColumns.set(
            $table.columns.map((column) => ({
                id: column.key,
                title: column.key,
                type: column.type as ColumnType,
                hide: !!selected?.includes(column.key),
                array: column?.array,
                width: { min: 168 },
                format: 'format' in column && column?.format === 'enum' ? column.format : null,
                elements: 'elements' in column ? column.elements : null
            }))
        );
    }

    let selectedRows: string[] = [];
    let showDelete = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedRows.map((rowId) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .grids.deleteRow(databaseId, tableId, rowId)
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.RowDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length} row${selectedRows.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.ROWS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.RowDelete);
        } finally {
            selectedRows = [];
            showDelete = false;
        }
    }

    enum Deletion {
        'setNull' = 'Set row ID as NULL in all related rows',
        'cascade' = 'All related rows will be deleted',
        'restrict' = 'Row cannot be deleted'
    }

    $: relatedColumns = $columns?.filter(
        (column) =>
            isRelationship(column) &&
            // One-to-One are always included
            (column.relationType === 'oneToOne' ||
                // One-to-Many: Only if parent is deleted
                (column.relationType === 'oneToMany' && column.side === 'parent') ||
                // Many-to-One: Only include if child is deleted
                (column.relationType === 'manyToOne' && column.side === 'child') ||
                // Many-to-Many: Only include if the parent is being deleted
                (isRelationshipToMany(column) && column.side === 'parent'))
    ) as Models.ColumnRelationship[];

    let checked = false;
</script>

<Table.Root
    let:root
    allowSelection
    bind:selectedRows
    columns={[
        { id: '$id', width: 200 },
        ...$tableColumns,
        { id: '$created', width: 200 },
        { id: '$updated', width: 200 }
    ]}>
    <svelte:fragment slot="header" let:root>
        <Table.Header.Cell column="$id" {root}>Row ID</Table.Header.Cell>
        {#each $tableColumns as column}
            <Table.Header.Cell column={column.id} {root}>{column.title}</Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="$created" {root}>Created</Table.Header.Cell>
        <Table.Header.Cell column="$updated" {root}>Updated</Table.Header.Cell>
    </svelte:fragment>
    {#each data.rows.rows as row (row.$id)}
        <Table.Row.Link
            {root}
            id={row.$id}
            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${$table.$id}/row-${row.$id}`}>
            <Table.Cell column="$id" {root}>
                {#key row.$id}
                    <Id value={row.$id}>
                        {row.$id}
                    </Id>
                {/key}
            </Table.Cell>

            {#each $tableColumns as { id } (id)}
                {@const column = $columns.find((n) => n.key === id)}
                {#if column}
                    <Table.Cell column={id} {root}>
                        {#if isRelationship(column)}
                            {@const args = displayNames?.[column.relatedTable] ?? ['$id']}
                            {#if !isRelationshipToMany(column)}
                                {#if row[id]}
                                    {@const related = row[id]}
                                    <Link.Button
                                        variant="muted"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            goto(
                                                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${column.relatedTable}/row-${related.$id}`
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
                                {@const itemsNum = row[id]?.length}
                                <Button.Button
                                    variant="extra-compact"
                                    disabled={!itemsNum}
                                    badge={itemsNum ?? 0}
                                    on:click={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        relationshipData = row[id];
                                        showRelationships = true;
                                        selectedRelationship = column;
                                    }}>
                                    Items
                                </Button.Button>
                            {/if}
                        {:else}
                            {@const datetime = row[id]}
                            {@const formatted = formatColumn(row[id])}
                            {@const isDatetimeColumn = column.type === 'datetime'}
                            {@const isEncryptedColumn = isString(column) && column.encrypt}
                            {#if isDatetimeColumn}
                                <DualTimeView time={datetime}>
                                    <span slot="title">Timestamp</span>
                                    {toLocaleDateTime(datetime, true)}
                                </DualTimeView>
                            {:else if isEncryptedColumn}
                                <button on:click={(e) => e.preventDefault()}>
                                    <InteractiveText
                                        copy={false}
                                        variant="secret"
                                        isVisible={false}
                                        text={formatted.value} />
                                </button>
                            {:else if formatted.truncated}
                                <Tooltip placement="bottom" disabled={!formatted.truncated}>
                                    <Typography.Text truncate>{formatted.value}</Typography.Text>
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
                            {:else}
                                <Typography.Text truncate>{formatted.value}</Typography.Text>
                            {/if}
                        {/if}
                    </Table.Cell>
                {/if}
            {/each}
            <Table.Cell column="$created" {root}>
                <DualTimeView time={row.$createdAt} />
            </Table.Cell>
            <Table.Cell column="$updated" {root}>
                <DualTimeView time={row.$updatedAt} />
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
                    {selectedRows.length > 1 ? 'rows' : 'row'}
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

<Confirm title="Delete rows" bind:open={showDelete} onSubmit={handleDelete}>
    <div>
        Are you sure you want to delete <b>{selectedRows.length}</b>
        {selectedRows.length > 1 ? 'rows' : 'row'}?

        {#if relatedColumns?.length}
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
                {#each relatedColumns as attr}
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
                        Delete row from <span data-private>{$table.name}</span>
                    </InputChoice>
                </ul>
            </div>
        {:else}
            <p class="u-bold">This action is irreversible.</p>
        {/if}
    </div>
</Confirm>

<style>
    .floating-action-bar {
        position: fixed;

        :global(div:first-of-type) {
            /* 50% > 60% because we have sub-navigation */
            left: calc(60% - var(--p-floating-action-bar-width) / 2);
        }
    }
</style>
