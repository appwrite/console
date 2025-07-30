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
    import { table, type Columns } from './store';
    import ColumnItem from './row-[row]/columnItem.svelte';
    import { isRelationship, isRelationshipToMany } from './row-[row]/columns/store';
    import { deepClone } from '$lib/helpers/object';

    const tableId = page.params.table;
    const databaseId = page.params.database;

    let {
        row = $bindable()
    }: {
        row: Models.Row;
    } = $props();

    let work = $state<Writable<Models.Row> | null>(null);

    function initWork() {
        const prohibitedKeys = [
            '$id',
            '$collection',
            '$tableId',
            '$databaseId',
            '$createdAt',
            '$updatedAt'
        ];

        const filteredKeys = Object.keys(row).filter((key) => {
            return !prohibitedKeys.includes(key);
        });

        const result = filteredKeys.reduce((obj, key) => {
            obj[key] = row[key];
            return obj;
        }, {});

        return writable(deepClone(result as Models.Row));
    }

    $effect(() => {
        if (row) work = initWork();
    });

    function compareAttributes(column: Columns, $work: Models.Row, $doc: Models.Row) {
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
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .grids.updateRow(databaseId, tableId, row.$id, $work, $work.$permissions);

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
        if (!work || !$table?.columns?.length) return true;

        return $table.columns.every((attribute) => compareAttributes(attribute, $work, row));
    }
</script>

{#if $table.columns?.length && work}
    {#each $table.columns as column}
        {@const label = column.key}
        <ColumnItem {column} bind:formValues={$work} {label} editing />
    {/each}
{/if}
