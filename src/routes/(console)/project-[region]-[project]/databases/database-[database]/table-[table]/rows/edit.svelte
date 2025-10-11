<script lang="ts">
    import { symmetricDifference } from '$lib/helpers/array';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { type Writable, writable } from 'svelte/store';
    import type { Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { type Columns, PROHIBITED_ROW_KEYS } from '../store';
    import ColumnItem from './columns/columnItem.svelte';
    import { buildWildcardColumnsQuery, isRelationship, isRelationshipToMany } from './store';
    import { Layout, Skeleton } from '@appwrite.io/pink-svelte';
    import { deepClone } from '$lib/helpers/object';
    import { type Entity, toRelationalField } from '$database/(entity)';

    let {
        table,
        row = $bindable(),
        rowId = $bindable(null)
    }: {
        table: Entity;
        row?: Models.Row | null;
        rowId?: string | null;
    } = $props();

    let loading = $state(false);

    let work = $state<Writable<Models.Row> | null>(null);
    let columnFormWrapper = $state<HTMLElement | null>(null);

    function initWork() {
        const filteredKeys = Object.keys(row).filter((key) => {
            return !PROHIBITED_ROW_KEYS.includes(key);
        });

        const result = filteredKeys.reduce((obj, key) => {
            obj[key] = row[key];
            return obj;
        }, {});

        return writable(deepClone(result as Models.Row));
    }

    async function loadRowFromId() {
        if (!rowId) return;
        loading = true;

        try {
            row = await sdk.forProject(page.params.region, page.params.project).tablesDB.getRow({
                databaseId: table.databaseId,
                tableId: table.$id,
                rowId,
                queries: buildWildcardColumnsQuery(table)
            });
        } catch (error) {
            addNotification({
                message: `Failed to load row: ${error.message}`,
                type: 'error'
            });

            row = null;
        } finally {
            rowId = null;
            loading = false;
        }
    }

    $effect(() => {
        if (!row && rowId) {
            loadRowFromId();
        }
    });

    $effect(() => {
        if (row) {
            work = initWork();
            focusFirstInput();
        } else {
            work = null;
        }
    });

    function compareColumns(column: Columns, $work: Models.Row, $doc: Models.Row) {
        if (!column) {
            return false;
        }

        const workColumn = $work?.[column.key];
        const currentColumn = $doc?.[column.key];

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
        if (!row || !work) return;

        try {
            await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
                databaseId: table.databaseId,
                tableId: table.$id,
                rowId: row.$id,
                data: $work,
                permissions: $work.$permissions
            });

            invalidate(Dependencies.ROW);
            trackEvent(Submit.RowUpdate);
            addNotification({
                message: 'Row has been updated',
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
        if (!work || !row || !table?.fields?.length) return true;

        return table.fields.every((column: Columns) => compareColumns(column, $work, row));
    }

    function focusFirstInput() {
        const firstInput = columnFormWrapper?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'
        );

        firstInput?.focus({ preventScroll: true });
    }

    function updateRowData(values: object) {
        work.set(values as Models.Row);
    }
</script>

{#if loading}
    <div style:margin-block="" style:margin-inline-end="2.25rem">
        <Skeleton variant="line" height={40} width="auto" />
    </div>
{:else if table.fields?.length && work}
    <div bind:this={columnFormWrapper}>
        <Layout.Stack direction="column" gap="xl">
            {#each table.fields as column}
                {@const label = column.key}
                <ColumnItem
                    {label}
                    editing
                    formValues={$work}
                    column={toRelationalField(column)}
                    onUpdateFormValues={updateRowData} />
            {/each}
        </Layout.Stack>
    </div>
{/if}
