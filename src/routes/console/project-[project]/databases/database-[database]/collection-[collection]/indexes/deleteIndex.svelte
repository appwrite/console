<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { collection } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;
    export let selectedIndex: Models.Index;

    const databaseId = $page.params.database;

    async function handleDelete() {
        try {
            await sdk.forProject.databases.deleteIndex(
                databaseId,
                $collection.$id,
                selectedIndex.key
            );
            await invalidate(Dependencies.COLLECTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Index has been deleted`
            });
            trackEvent(Submit.IndexDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.IndexDelete);
        }
    }
</script>

<Modal
    icon="exclamation"
    state="warning"
    onSubmit={handleDelete}
    bind:show={showDelete}
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteIndex()}</svelte:fragment>

    <p data-private>
        {$LL.console.project.texts.databases.delete()}{' '}<b
            >'{selectedIndex.key}'{' '}{$LL.console.project.texts.databases.from()}{' '}{$collection.name}</b
        >?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
