<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputSwitch } from '$lib/elements/forms';
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
    <Heading tag="h6" size="7" id="document-security">Document level permissions</Heading>
    <svelte:fragment slot="aside">
        <FormList>
            <InputSwitch
                bind:value={collectionDocumentSecurity}
                id="security"
                label="Document level permissions" />
        </FormList>
        <p class="text">
            When document level permissions are enabled, users will be able to access documents for which they
            have been granted <b>either document or collection level permissions</b>.
        </p>
        <p class="text">
            When document level permissions are disabled, users can only access 
            documents <b>if they have been granted collection level 
            permissions</b>. You will not be able to assign different permissions
            to individual documents.
        </p>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button
            disabled={collectionDocumentSecurity === $collection.documentSecurity}
            on:click={updateSecurity}>Update</Button>
    </svelte:fragment>
</CardGrid>
