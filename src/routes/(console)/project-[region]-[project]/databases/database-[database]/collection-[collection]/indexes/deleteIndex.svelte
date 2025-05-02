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

    export let showDelete = false;
    export let selectedIndex: Models.Index;

    const databaseId = page.params.database;
    let error: string;

    async function handleDelete() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.deleteIndex(databaseId, $collection.$id, selectedIndex.key);
            await invalidate(Dependencies.COLLECTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Index has been deleted`
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
        Are you sure you want to delete <b>{selectedIndex.key}</b> from <b>{$collection.name}</b>?
    </Typography.Text>
</Confirm>
