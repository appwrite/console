<script lang="ts">
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import Confirm from '$lib/components/confirm.svelte';
    import { getTerminologies } from '$database/(entity)';

    let {
        showDelete = $bindable(false),
        selectedIndex = $bindable(null),
        onDeleteIndexes
    }: {
        showDelete: boolean;
        selectedIndex: Models.ColumnIndex | string[] | null;
        onDeleteIndexes: (selectedKeys: string[]) => Promise<void>;
    } = $props();

    let error: string = $state(null);
    let selectedKeys = $derived(getKeys(selectedIndex));

    const { dependencies } = getTerminologies();

    function getKeys(selected: Models.ColumnIndex | string[]): string[] {
        return Array.isArray(selected) ? selected : [selected.key];
    }

    async function cleanup() {
        // reset selection!
        selectedIndex = Array.isArray(selectedIndex) ? [] : null;

        showDelete = false; // hide.

        // events and notif!
        trackEvent(Submit.IndexDelete);
        addNotification({
            type: 'success',
            message:
                selectedKeys.length === 1
                    ? 'Index has been deleted'
                    : `${selectedKeys.length} indexes have been deleted`
        });

        console.log(`cleanup > selectedIndex`, selectedIndex, selectedKeys);

        // invalidate proper dependency.
        await invalidate(dependencies.entity.singular);
    }

    async function handleDelete() {
        try {
            await onDeleteIndexes(selectedKeys);
            await cleanup();
        } catch (e) {
            error = e.message;
            trackError(e, Submit.IndexDelete);
        }
    }
</script>

<Confirm
    bind:error
    confirmDeletion
    title="Delete index"
    bind:open={showDelete}
    onSubmit={handleDelete}>
    {#if selectedKeys.length === 1}
        <p>Are you sure you want to delete <b>{selectedKeys[0]}</b>?</p>
        <p>
            Deleting this index may slow down queries that depend on it. This action is
            irreversible.
        </p>
    {:else}
        <p>Are you sure you want to delete <b>{selectedKeys.join(', ')}</b>?</p>
        <p>
            Deleting these indexes may slow down queries that depend on it. This action is
            irreversible.
        </p>
    {/if}
</Confirm>
