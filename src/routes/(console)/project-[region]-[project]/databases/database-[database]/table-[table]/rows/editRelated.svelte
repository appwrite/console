<script lang="ts">
    import { symmetricDifference } from '$lib/helpers/array';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { type Writable, writable } from 'svelte/store';
    import { type Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { type Columns, PROHIBITED_ROW_KEYS } from '../store';
    import ColumnItem from './columns/columnItem.svelte';
    import { buildWildcardColumnsQuery, isRelationship, isRelationshipToMany } from './store';
    import { Layout, Skeleton } from '@appwrite.io/pink-svelte';
    import { deepClone } from '$lib/helpers/object';

    const databaseId = page.params.database;

    let {
        rowId,
        tableId
    }: {
        rowId: string;
        tableId: string;
    } = $props();

    let loading = $state(false);
    let fetchedRow = $state<Models.Row | null>(null);
    let relatedTable = $state<Models.Table | null>(null);

    let work = $state<Writable<Models.Row> | null>(null);
    let columnFormWrapper = $state<HTMLElement | null>(null);

    async function loadRelatedRow() {
        loading = true;

        try {
            relatedTable =
                page.data.tables?.[tableId] ??
                (await sdk.forProject(page.params.region, page.params.project).tablesDb.getTable({
                    databaseId,
                    tableId: tableId
                }));

            fetchedRow = await sdk
                .forProject(page.params.region, page.params.project)
                .tablesDb.getRow({
                    databaseId,
                    tableId: tableId,
                    rowId: rowId,
                    queries: buildWildcardColumnsQuery(relatedTable)
                });

            const filteredKeys = Object.keys(fetchedRow).filter((key) => {
                return !PROHIBITED_ROW_KEYS.includes(key);
            });

            const workingData = filteredKeys.reduce((obj, key) => {
                obj[key] = fetchedRow[key];
                return obj;
            }, {});

            work = writable(deepClone(workingData as Models.Row));
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

    $effect(() => {
        if (rowId && tableId) {
            loadRelatedRow().then(() => {
                focusFirstInput();
            });
        }
    });

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

    export async function update() {
        try {
            await sdk.forProject(page.params.region, page.params.project).tablesDb.updateRow({
                databaseId,
                tableId: relatedTable.$id,
                rowId: fetchedRow.$id,
                data: $work,
                permissions: $work.$permissions
            });

            invalidate(Dependencies.ROW);
            trackEvent(Submit.RowUpdate);
            addNotification({
                message: 'Related row has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.RowUpdate);
        }
    }

    export function isDisabled(): boolean {
        if (!work || !relatedTable?.columns?.length || !fetchedRow) return true;

        return relatedTable.columns.every((column) => compareColumns(column, $work, fetchedRow));
    }

    function focusFirstInput() {
        const firstInput = columnFormWrapper?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'
        );

        firstInput?.focus({ preventScroll: true });
    }
</script>

{#if loading}
    <div style:margin-block="" style:margin-inline-end="2.25rem">
        <Skeleton variant="line" height={40} width="auto" />
    </div>
{:else if relatedTable?.columns?.length && work}
    <div bind:this={columnFormWrapper}>
        <Layout.Stack direction="column" gap="l">
            {#each relatedTable.columns as column}
                {@const label = column.key}
                <ColumnItem {column} bind:formValues={$work} {label} editing />
            {/each}
        </Layout.Stack>
    </div>
{/if}
