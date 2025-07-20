<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { table } from '../store';
    import type { Columns } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isRelationship } from '../row-[row]/columns/store';
    import Confirm from '$lib/components/confirm.svelte';

    export let showDelete = false;
    export let selectedColumn: Columns;

    const databaseId = page.params.database;

    let error: string;
    let checked = false;

    async function handleDelete() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .tables.deleteColumn(databaseId, $table.$id, selectedColumn.key);

            showDelete = false;
            addNotification({
                type: 'success',
                message: `Column has been deleted`
            });
            trackEvent(Submit.ColumnDelete);
            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${page.params.table}/columns`
            );
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ColumnDelete);
        }
    }

    $: isDeleteBtnDisabled = isRelationship(selectedColumn) && selectedColumn?.twoWay && !checked;
</script>

<Confirm
    bind:open={showDelete}
    onSubmit={handleDelete}
    title="Delete column"
    bind:error
    disabled={isDeleteBtnDisabled}>
    <p>
        Are you sure you want to delete <b data-private>{selectedColumn?.key}</b> from
        <b data-private>{$table?.name}</b>?
    </p>
    {#if isRelationship(selectedColumn) && selectedColumn?.twoWay}
        <div class="u-flex u-flex-vertical u-gap-24">
            <p>
                This is a two way relationship and the corresponding relationship will also be
                deleted.
            </p>
            <p><b>This action is irreversible.</b></p>
            <ul>
                <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                    Delete relationship between <b data-private>{selectedColumn.key}</b> to
                    <b data-private>{selectedColumn.twoWayKey}</b>
                </InputChoice>
            </ul>
        </div>
    {/if}
</Confirm>
