<script lang="ts">
    import { symmetricDifference } from '$lib/helpers/array';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { get, type Writable, writable } from 'svelte/store';
    import { type Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { type Columns, PROHIBITED_ROW_KEYS } from '../store';
    import ColumnItem from './columns/columnItem.svelte';
    import { buildWildcardColumnsQuery, isRelationship, isRelationshipToMany } from './store';
    import { Divider, Layout, Skeleton, Typography } from '@appwrite.io/pink-svelte';
    import { deepClone } from '$lib/helpers/object';

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
    let relatedTable = $state<Models.Table | null>(null);

    let disabledState = $state(calculateAndCompareDisabledState());

    let workData = $state<Map<string, Writable<Models.Row>>>(new Map());
    let columnFormWrapper = $state<HTMLElement | null>(null);

    function isSingleStore() {
        return typeof rows === 'string';
    }

    async function loadRelatedRow() {
        loading = true;

        try {
            relatedTable =
                page.data.tables?.[tableId] ??
                (await sdk.forProject(page.params.region, page.params.project).tablesDB.getTable({
                    databaseId,
                    tableId: tableId
                }));

            if (isSingleStore()) {
                const fetchedRow = await sdk
                    .forProject(page.params.region, page.params.project)
                    .tablesDB.getRow({
                        databaseId,
                        tableId: tableId,
                        rowId: rows as string,
                        queries: buildWildcardColumnsQuery(relatedTable)
                    });

                fetchedRows = [fetchedRow];
            } else {
                const rowIds = (rows as Models.Row[]).map((row) => row.$id);
                const fetchPromises = rowIds.map(async (rowId) => {
                    return sdk.forProject(page.params.region, page.params.project).tablesDB.getRow({
                        databaseId,
                        tableId: tableId,
                        rowId: rowId,
                        queries: buildWildcardColumnsQuery(relatedTable)
                    });
                });

                fetchedRows = await Promise.all(fetchPromises);
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

                newWorkData.set(row.$id, writable(deepClone(workingData as Models.Row)));
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

    function compareColumns(column: Columns, $work: Models.Row, originalRow: Models.Row) {
        if (!column) {
            return false;
        }

        const workColumn = $work?.[column.key];
        const currentColumn = originalRow?.[column.key];

        if (column.array) {
            return !symmetricDifference(Array.from(workColumn), Array.from(currentColumn)).length;
        }

        if (isRelationship(column)) {
            if (isRelationshipToMany(column as Models.ColumnRelationship)) {
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
        if (!relatedTable?.columns?.length || !fetchedRows.length) return true;

        if (isSingleStore()) {
            const rowId = fetchedRows[0].$id;

            const row = fetchedRows.find((r) => r.$id === rowId);
            const work = workData.get(rowId);
            if (!row || !work) return true;

            const workValue = get(work);
            return relatedTable.columns.every((column) => compareColumns(column, workValue, row));
        } else {
            return fetchedRows.every((row) => {
                const work = workData.get(row.$id);
                if (!work) return true;

                const workValue = get(work);

                return relatedTable.columns.every((column) =>
                    compareColumns(column, workValue, row)
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

    $effect(() => {
        if (rows && tableId) {
            loadRelatedRow().then(() => {
                focusFirstInput();
            });
        }
    });
</script>

{#if loading}
    <div style:margin-block="" style:margin-inline-end="2.25rem">
        <Skeleton variant="line" height={40} width="auto" />
    </div>
{:else if relatedTable?.columns?.length && fetchedRows.length}
    <div bind:this={columnFormWrapper}>
        {#if fetchedRows.length === 1}
            {@const workStore = getStore(fetchedRows[0].$id)}
            {#if workStore}
                <Layout.Stack direction="column" gap="l">
                    {#each relatedTable.columns as column}
                        {@const label = column.key}
                        <ColumnItem
                            {column}
                            {label}
                            editing
                            formValues={workStore}
                            onUpdateFormValues={handleFormUpdate(fetchedRows[0].$id)} />
                    {/each}
                </Layout.Stack>
            {/if}
        {:else}
            <Layout.Stack direction="column" gap="m" class="column-item-stack">
                <Typography.Text variant="l-400">{relatedTable.name}</Typography.Text>
                <Layout.Stack direction="column" gap="xxl" class="column-item-stack">
                    {#each fetchedRows as row, index (row.$id)}
                        {@const workStore = getStore(row.$id)}
                        {#if workStore}
                            {#each relatedTable.columns as column}
                                {@const label = column.key}
                                <ColumnItem
                                    {column}
                                    {label}
                                    editing
                                    formValues={workStore}
                                    onUpdateFormValues={handleFormUpdate(row.$id)} />
                            {/each}
                        {/if}

                        {#if index < fetchedRows.length - 1}
                            <Divider />
                        {/if}
                    {/each}
                </Layout.Stack>
            </Layout.Stack>
        {/if}
    </div>
{/if}
