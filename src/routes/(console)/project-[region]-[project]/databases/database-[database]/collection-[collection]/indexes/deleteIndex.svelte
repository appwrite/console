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
    import { Typography } from '@appwrite.io/pink-svelte';

    let {
        showDelete = $bindable(false),
        selectedIndex = $bindable(null),
    }: {
        showDelete: boolean;
        selectedIndex: Models.Index | string[]
    } = $props()

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

<Confirm onSubmit={handleDelete} title="Delete index" bind:open={showDelete} bind:error>
    <Typography.Text>
        {#if selectedKeys.length === 1}
            Are you sure you want to delete <b>{selectedKeys[0]}</b> from
            <b>{$collection.name}</b>?
        {:else}
            Are you sure you want to delete
            <b>
                {selectedKeys.join(', ')}
            </b>
            from <b>{$collection.name}</b>?
        {/if}
    </Typography.Text>
</Confirm>
