<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Permissions } from '$lib/components/permissions';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from '../store';
    import LL from '$i18n/i18n-svelte';

    const databaseId = $page.params.database;

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
                message: $LL.components.notification.permissionsUpdated(),
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

    $: if (
        collectionPermissions &&
        symmetricDifference(collectionPermissions, $collection.$permissions).length
    ) {
        arePermsDisabled = false;
    } else arePermsDisabled = true;
</script>

<CardGrid>
    <Heading tag="h6" size="7">{$LL.console.project.title.permissions()}</Heading>
    <p class="text">
        {$LL.console.project.texts.databases.updatePermission.collectionAndDocumentation()}{' '}<a
            href="https://appwrite.io/docs/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            {$LL.console.project.texts.databases.updatePermission.permissionGuide()}
        </a>.
    </p>
    <svelte:fragment slot="aside">
        {#if collectionPermissions}
            <Permissions bind:permissions={collectionPermissions} withCreate />
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button disabled={arePermsDisabled} on:click={updatePermissions}
            >{$LL.console.project.button.submit.update()}</Button>
    </svelte:fragment>
</CardGrid>
