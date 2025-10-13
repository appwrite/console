<script lang="ts">
    import { symmetricDifference } from '$lib/helpers/array';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { get, type Writable, writable } from 'svelte/store';
    import { type Models, Query } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { type Columns, PROHIBITED_ROW_KEYS } from '../store';
    import ColumnItem from './columns/columnItem.svelte';
    import { buildWildcardColumnsQuery, isRelationship, isRelationshipToMany } from './store';
    import { Accordion, Layout, Skeleton } from '@appwrite.io/pink-svelte';
    import { deepClone } from '$lib/helpers/object';
    import { preferences } from '$lib/stores/preferences';
    import {
        type Entity,
        type Field,
        getTerminologies,
        toRelationalField
    } from '$database/(entity)';
    import { onMount } from 'svelte';

    const databaseId = page.params.database;

    let {
        rows,
        tableId
    }: {
        rows: string | Models.Row[];
        tableId: string;
    } = $props();

    let loading = $state(false);
    let fetchedRows = $state<Models.Row[]>([]);
    let relatedTable = $state<Entity | null>(null);

    let disabledState = $state(calculateAndCompareDisabledState());

    let workData = $state<Map<string, Writable<Models.Row>>>(new Map());
    let columnFormWrapper = $state<HTMLElement | null>(null);

    const { databasesSdk } = getTerminologies();

    onMount(() => {
        if (rows && tableId) {
            loadRelatedRow().then(() => {
                focusFirstInput();
            });
        }
    });

    function isSingleStore() {
        return typeof rows === 'string';
    }

    async function loadRelatedRow() {
        loading = true;

        try {
            if (isSingleStore()) {
                const fetchedRow = await sdk
                    .forProject(page.params.region, page.params.project)
                    .tablesDB.getRow({
                        databaseId,
                        tableId: tableId,
                        rowId: rows as string,
                        queries: buildWildcardColumnsQuery(relatedTable)
                    });

                // cannot use page.data.entities!
                relatedTable = await databaseSdk.getEntity({
                    databaseId,
                    entityId: tableId
                });

                fetchedRows = [fetchedRow];
            } else {
                let fetchedTables = [];
                const processedRows = [];
                const existingRows = rows as Models.Row[];

                const firstTableId = existingRows[0].$tableId;

                const uniqueTableIds = [...new Set(existingRows.map((row) => row.$tableId))];
                const missingTableIds = uniqueTableIds.filter((tableId) => {
                    return !page.data.tables?.find((table: Models.Table) => table.$id === tableId);
                });

                if (missingTableIds.length > 0) {
                    const tablesResponse = await databasesSdk.listEntities({
                        databaseId,
                        queries: [
                            Query.equal('$id', missingTableIds),
                            Query.limit(missingTableIds.length)
                        ]
                    });

                    fetchedTables = tablesResponse.entities;
                }

                const allTables = [...(page.data.entities || []), ...fetchedTables];
                relatedTable = allTables.find((table) => table.$id === firstTableId) || null;

                let rowsMissingData = [];

                for (const row of existingRows) {
                    const rowTable = allTables.find((table) => table.$id === row.$tableId);

                    const hasAllColumns = rowTable.columns.every(
                        (column: Columns) => column.key in row
                    );

                    if (!hasAllColumns) {
                        rowsMissingData.push({ row, rowTable });
                    } else {
                        processedRows.push(row);
                    }
                }

                if (rowsMissingData.length > 0) {
                    const rowsByTable = new Map();

                    for (const { row, rowTable } of rowsMissingData) {
                        if (!rowsByTable.has(row.$tableId)) {
                            rowsByTable.set(row.$tableId, { rows: [], rowTable });
                        }

                        rowsByTable.get(row.$tableId).rows.push(row);
                    }

                    const fetchPromises = Array.from(rowsByTable.entries()).map(
                        async ([tableId, { rows, rowTable }]) => {
                            const rowIds: string[] = rows.map((row: Models.Row) => row.$id);
                            const response = await sdk
                                .forProject(page.params.region, page.params.project)
                                .tablesDB.listRows({
                                    databaseId,
                                    tableId,
                                    queries: [
                                        Query.equal('$id', rowIds),
                                        Query.limit(rowIds.length),
                                        ...buildWildcardColumnsQuery(rowTable)
                                    ]
                                });
                            return response.rows;
                        }
                    );

                    const allCompleteRows = await Promise.all(fetchPromises);
                    processedRows.push(...allCompleteRows.flat());
                }

                fetchedRows = processedRows;
            }

            const newWorkData = new Map();
            fetchedRows.forEach((row) => {
                const filteredKeys = Object.keys(row).filter((key) => {
                    return !PROHIBITED_ROW_KEYS.includes(key);
                });

                const workingData = filteredKeys.reduce((obj, key) => {
                    obj[key] = row[key];
                    return obj;
                }, {});

                const clonedObject = deepClone(workingData as Models.Row);
                newWorkData.set(row.$id, writable(clonedObject));
            });

            workData = newWorkData;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.RowUpdate);
        } finally {
            loading = false;
        }
    }

    function compareColumns(field: Field, $work: Models.Row, originalRow: Models.Row) {
        if (!field) {
            return false;
        }

        const workColumn = $work?.[field.key];
        const currentColumn = originalRow?.[field.key];

        if (field.array) {
            return !symmetricDifference(Array.from(workColumn), Array.from(currentColumn)).length;
        }

        if (isRelationship(field)) {
            if (isRelationshipToMany(field as Models.ColumnRelationship)) {
                if (!Array.isArray(workColumn) || !Array.isArray(currentColumn)) {
                    return workColumn === currentColumn;
                }

                const workIds = workColumn.map((doc: string | Record<string, unknown>) =>
                    typeof doc === 'string' ? doc : doc.$id
                );

                const relatedIds = currentColumn.map((doc: string | Record<string, unknown>) =>
                    typeof doc === 'string' ? doc : doc.$id
                );

                return !symmetricDifference(workIds, relatedIds).length;
            } else {
                const workId = typeof workColumn === 'string' ? workColumn : workColumn?.$id;
                const relatedId =
                    typeof currentColumn === 'string' ? currentColumn : currentColumn?.$id;

                return workId === relatedId;
            }
        }

        return workColumn === currentColumn;
    }

    function calculateAndCompareDisabledState() {
        if (!relatedTable?.fields?.length || !fetchedRows.length) return true;

        if (isSingleStore()) {
            const rowId = fetchedRows[0].$id;

            const row = fetchedRows.find((r) => r.$id === rowId);
            const work = workData.get(rowId);
            if (!row || !work) return true;

            const workValue = get(work);
            return relatedTable.fields.every((field: Field) =>
                compareColumns(field, workValue, row)
            );
        } else {
            return fetchedRows.every((row) => {
                const work = workData.get(row.$id);
                if (!work) return true;

                const workValue = get(work);

                return relatedTable.fields.every((field: Field) =>
                    compareColumns(field, workValue, row)
                );
            });
        }
    }

    export async function update(rowId?: string) {
        try {
            if (rowId) {
                const work = workData.get(rowId);

                const workValue = get(work);
                await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
                    databaseId,
                    tableId: relatedTable.$id,
                    rowId: rowId,
                    data: workValue,
                    permissions: workValue.$permissions
                });

                addNotification({
                    message: 'Related row has been updated',
                    type: 'success'
                });
            } else {
                const updatePromises = fetchedRows.map(async (row) => {
                    const work = workData.get(row.$id);
                    if (!work) return;

                    const workValue = get(work);
                    return sdk
                        .forProject(page.params.region, page.params.project)
                        .tablesDB.updateRow({
                            databaseId,
                            tableId: relatedTable.$id,
                            rowId: row.$id,
                            data: workValue,
                            permissions: workValue.$permissions
                        });
                });

                await Promise.all(updatePromises);

                addNotification({
                    message: 'Related row has been updated',
                    type: 'success'
                });
            }

            invalidate(Dependencies.ROW);
            trackEvent(Submit.RowUpdate);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.RowUpdate);
        }
    }

    export function isDisabled(): boolean {
        return disabledState;
    }

    function focusFirstInput() {
        const firstInput = columnFormWrapper?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'
        );

        firstInput?.focus({ preventScroll: true });
    }

    function getStore(id: string) {
        const rowInstance = workData.get(id);
        return get(rowInstance);
    }

    function handleFormUpdate(rowId: string) {
        return (updatedFormValues: object) => {
            const workStore = workData.get(rowId);
            if (workStore) {
                workStore.set(updatedFormValues as Models.Row);
                disabledState = calculateAndCompareDisabledState();
            }
        };
    }

    function getAccordionTitle(row: Models.Row): string {
        const names = preferences.getDisplayNames(row.$tableId).filter((name) => name !== '$id');

        const values = names
            .map((name) => row?.[name])
            .filter((value) => value != null && typeof value === 'string' && value !== '');

        if (!values.length) {
            return row.$id;
        }

        return `${values.join(' | ')} (...${row.$id.slice(-5)})`;
    }
</script>

{#if loading}
    <div style:margin-inline-end="2.25rem">
        <Skeleton variant="line" height={40} width="auto" />
    </div>
{:else if relatedTable?.fields?.length && fetchedRows.length}
    <!-- we should not show current table column items in this view -->
    {@const twoWayKeys = new Set(
        relatedTable.fields
            .filter((column: Models.ColumnRelationship) => column.twoWay)
            .map((c) => c.key)
    )}

    <!-- render the filtered ones -->
    {@const columnsToRender = relatedTable.fields.filter(
        (field: Field) => !twoWayKeys.has(field.key)
    )}

    <div bind:this={columnFormWrapper}>
        {#if fetchedRows.length === 1}
            {@const workStore = getStore(fetchedRows[0].$id)}
            {#if workStore}
                <Layout.Stack direction="column" gap="l">
                    {#each columnsToRender as column}
                        {@const label = column.key}
                        <ColumnItem
                            {label}
                            editing
                            formValues={workStore}
                            column={toRelationalField(column)}
                            onUpdateFormValues={handleFormUpdate(fetchedRows[0].$id)} />
                    {/each}
                </Layout.Stack>
            {/if}
        {:else}
            <Layout.Stack direction="column" gap="m" class="column-item-stack">
                <Layout.Stack direction="column" gap="xs" class="column-item-stack">
                    {#each fetchedRows as row, index (row.$id)}
                        {@const workStore = getStore(row.$id)}
                        <Accordion
                            title={getAccordionTitle(row)}
                            hideDivider={index >= fetchedRows.length - 1}>
                            {#if workStore}
                                <Layout.Stack direction="column" gap="m">
                                    {#each columnsToRender as column}
                                        {@const label = column.key}
                                        <ColumnItem
                                            {label}
                                            editing
                                            formValues={workStore}
                                            column={toRelationalField(column)}
                                            onUpdateFormValues={handleFormUpdate(row.$id)} />
                                    {/each}
                                </Layout.Stack>
                            {/if}
                        </Accordion>
                    {/each}
                </Layout.Stack>
            </Layout.Stack>
        {/if}
    </div>
{/if}

<style lang="scss">
    :global(.column-item-stack .divider) {
        margin-inline-start: 4px;
    }
</style>
