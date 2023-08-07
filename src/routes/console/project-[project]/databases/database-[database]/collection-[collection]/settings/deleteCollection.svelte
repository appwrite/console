<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { collection } from '../store';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;

    const databaseId = $page.params.database;

    async function handleDelete() {
        try {
            await sdk.forProject.databases.deleteCollection(databaseId, $collection.$id);
            await invalidate(Dependencies.DATABASE);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$collection.name} ${$LL.components.notification.hasBeenDeleted()}`
            });
            trackEvent(Submit.CollectionDelete);
            await goto(
                `${base}/console/project-${$page.params.project}/databases/database-${$page.params.database}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.CollectionDelete);
        }
    }
</script>

<Modal
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteCollection()}</svelte:fragment>

    <p data-private>
        {$LL.console.project.texts.databases.delete()}{' '}<b>{$collection.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
