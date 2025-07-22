<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { CardGrid } from '$lib/components';
    import { table } from '../store';
    import { row } from './store';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import type { Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import ColumnForm from './columnForm.svelte';

    let disableUpdate = true;
    let currentRow: string;
    const databaseId = page.params.database;
    const tableId = page.params.table;
    const rowId = page.params.row;

    const work = writable(
        Object.keys($row)
            .filter((key) => {
                return ![
                    '$id',
                    '$collection',
                    '$tableId',
                    '$databaseId',
                    '$createdAt',
                    '$updatedAt'
                ].includes(key);
            })
            .reduce((obj, key) => {
                obj[key] = $row[key];
                return obj;
            }, {}) as Models.Row
    );

    onMount(async () => {
        currentRow = JSON.stringify($work);
    });

    $: {
        disableUpdate = currentRow === JSON.stringify($work);
    }

    async function updateData() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .tables.updateRow(databaseId, tableId, rowId, $work, $work.$permissions);
            await invalidate(Dependencies.ROW);

            currentRow = JSON.stringify($work);
            trackEvent(Submit.RowUpdate);
            disableUpdate = true;
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
</script>

<CardGrid>
    <svelte:fragment slot="title">Data</svelte:fragment>
    Update row data based on the columns created earlier.
    <svelte:fragment slot="aside">
        <ColumnForm columns={$table.columns} bind:formValues={$work} />
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={disableUpdate} on:click={() => updateData()}>Update</Button>
    </svelte:fragment>
</CardGrid>
