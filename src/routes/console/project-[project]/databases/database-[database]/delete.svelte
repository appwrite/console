<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { database } from './store';
    import LL from '$i18n/i18n-svelte';

    const databaseId = $page.params.database;

    export let showDelete = false;

    const handleDelete = async () => {
        try {
            await sdk.forProject.databases.delete(databaseId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$database.name} has been deleted`
            });
            await goto(`${base}/console/project-${$page.params.project}/databases`);
            trackEvent(Submit.DatabaseDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseDelete);
        }
    };
</script>

<Modal
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}>
    <svelte:fragment slot="header"
        >{$LL.console.project.table.header.deleteDatabase()}</svelte:fragment>
    <p class="text" data-private>
        {$LL.console.project.texts.databases.delete()} <b>{$database.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>
            {$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.delete()}</Button>
    </svelte:fragment>
</Modal>
