<script lang="ts">
    import { Container } from '$lib/layout';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { CardGrid } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import type { Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { table, type Columns } from '../store';
    import ColumnItem from './columnItem.svelte';
    import { isRelationship, isRelationshipToMany } from './columns/store';
    import { deepClone } from '$lib/helpers/object';

    export let data;

    const row = data.row;
    const databaseId = page.params.database;
    const tableId = page.params.table;
    const rowId = page.params.row;

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

    const work = initWork();

    async function updateData() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .grids.updateRow(databaseId, tableId, rowId, $work, $work.$permissions);

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

    function compareColumns(column: Columns, related: Models.Row, row: Models.Row) {
        if (!column) {
            return false;
        }

        const rowColumn = row?.[column.key];
        const relatedColumn = related?.[column.key];

        // undefined for a second, not sure why!
        if (rowColumn === undefined || relatedColumn === undefined) {
            return false;
        }

        if (column.array) {
            return !symmetricDifference(Array.from(relatedColumn), Array.from(rowColumn)).length;
        }

        if (isRelationship(column)) {
            if (isRelationshipToMany(column as Models.ColumnRelationship)) {
                const workIds = relatedColumn.map((doc: string | Record<string, unknown>) =>
                    typeof doc === 'string' ? doc : doc.$id
                );

                const relatedIds = rowColumn.map((doc: string | Record<string, unknown>) =>
                    typeof doc === 'string' ? doc : doc.$id
                );
                return !symmetricDifference(workIds, relatedIds).length;
            } else {
                const workId =
                    typeof relatedColumn === 'string' ? relatedColumn : relatedColumn?.$id;
                const relatedId = typeof rowColumn === 'string' ? rowColumn : rowColumn?.$id;

                return workId === relatedId;
            }
        }
        return relatedColumn === rowColumn;
    }
</script>

<svelte:head>
    <title>Data - Appwrite</title>
</svelte:head>

<Container>
    {#if $table?.columns?.length}
        {#each $table.columns as column}
            {@const label = column.key}
            <CardGrid>
                <svelte:fragment slot="title">{label}</svelte:fragment>

                <svelte:fragment slot="aside">
                    <ColumnItem {column} bind:formValues={$work} {label} editing />
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        disabled={compareColumns(column, $work, row)}
                        on:click={() => updateData()}>Update</Button>
                </svelte:fragment>
            </CardGrid>
        {/each}
    {/if}
</Container>
