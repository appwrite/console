<script lang="ts">
    import { addNotification } from '$lib/stores/notifications';
    import { collection } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Confirm from '$lib/components/confirm.svelte';

    let {
        showDelete = $bindable(false),
        selectedIndex = $bindable(null)
    }: {
        showDelete: boolean;
        selectedIndex: Models.Index | string[];
    } = $props();

    let error: string = $state(null);
    let selectedKeys = $derived(getKeys(selectedIndex));

    function getKeys(selected: Models.Index | string[]): string[] {
        return Array.isArray(selected) ? selected : [selected.key];
    }

    async function handleDelete() {
        try {
            await Promise.all(
                selectedKeys.map((key) =>
                    sdk
                        .forProject(page.params.region, page.params.project)
                        .databases.deleteIndex(page.params.database, $collection.$id, key)
                )
            );
            await invalidate(Dependencies.COLLECTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message:
                    selectedKeys.length === 1
                        ? 'Index has been deleted'
                        : `${selectedKeys.length} indexes have been deleted`
            });
            trackEvent(Submit.IndexDelete);
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
