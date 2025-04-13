<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Permissions } from '$lib/components/permissions';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from '../store';
    import { Link } from '@appwrite.io/pink-svelte';

    const databaseId = page.params.database;

    let arePermsDisabled = true;

    let collectionPermissions: string[] = null;

    onMount(() => {
        collectionPermissions ??= $collection.$permissions;
    });

    async function updatePermissions() {
        try {
            await sdk.forProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                $collection.name,
                collectionPermissions,
                $collection.documentSecurity,
                $collection.enabled
            );
            await invalidate(Dependencies.COLLECTION);
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.CollectionUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.CollectionUpdatePermissions);
        }
    }

    $: arePermsDisabled = !(
        collectionPermissions &&
        symmetricDifference(collectionPermissions, $collection.$permissions).length
    );
</script>

<CardGrid>
    <svelte:fragment slot="title">Permissions</svelte:fragment>
    Choose who can access your collection and documents. <Link.Anchor
        href="https://appwrite.io/docs/products/databases/permissions"
        target="_blank"
        rel="noopener noreferrer">
        Learn more
    </Link.Anchor>.
    <svelte:fragment slot="aside">
        {#if collectionPermissions}
            <Permissions bind:permissions={collectionPermissions} withCreate />
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button disabled={arePermsDisabled} on:click={updatePermissions}>Update</Button>
    </svelte:fragment>
</CardGrid>
