<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from '../store';

    const databaseId = page.params.database;

    let enabled: boolean = null;

    onMount(() => {
        enabled ??= $collection.enabled;
    });

    async function toggleCollection() {
        try {
            await sdk.forProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                $collection.name,
                $collection.$permissions,
                $collection.documentSecurity,
                enabled
            );
            await invalidate(Dependencies.COLLECTION);
            addNotification({
                message: `${$collection.name} has been updated`,
                type: 'success'
            });
            trackEvent(Submit.CollectionUpdateEnabled);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.CollectionUpdateEnabled);
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">{$collection.name}</svelte:fragment>
    <svelte:fragment slot="aside">
        <ul>
            <InputSwitch
                id="toggle"
                label={enabled ? 'Enabled' : 'Disabled'}
                bind:value={enabled} />
        </ul>
        <div>
            <p>Created: {toLocaleDateTime($collection.$createdAt)}</p>
            <p>Last updated: {toLocaleDateTime($collection.$updatedAt)}</p>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={enabled === $collection.enabled} on:click={toggleCollection}>
            Update
        </Button>
    </svelte:fragment>
</CardGrid>
