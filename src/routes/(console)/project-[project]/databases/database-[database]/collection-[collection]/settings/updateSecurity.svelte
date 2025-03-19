<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from '../store';

    const databaseId = $page.params.database;

    let collectionDocumentSecurity: boolean = null;

    onMount(() => {
        collectionDocumentSecurity ??= $collection.documentSecurity;
    });

    async function updateSecurity() {
        try {
            await sdk.forProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                $collection.name,
                $collection.$permissions,
                collectionDocumentSecurity,
                $collection.enabled
            );
            await invalidate(Dependencies.COLLECTION);
            addNotification({
                message: 'Security has been updated',
                type: 'success'
            });
            trackEvent(Submit.CollectionUpdateSecurity);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.CollectionUpdateSecurity);
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Document security</svelte:fragment>
    <svelte:fragment slot="aside">
        <InputSwitch
            bind:value={collectionDocumentSecurity}
            id="security"
            label="Document security" />

        <p class="text">
            When document security is enabled, users will be able to access documents for which they
            have been granted <b>either document or collection permissions</b>.
        </p>
        <p class="text">
            If document security is disabled, users can access documents <b
                >only if they have collection permissions</b
            >. Document permissions will be ignored.
        </p>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button
            disabled={collectionDocumentSecurity === $collection.documentSecurity}
            on:click={updateSecurity}>Update</Button>
    </svelte:fragment>
</CardGrid>
