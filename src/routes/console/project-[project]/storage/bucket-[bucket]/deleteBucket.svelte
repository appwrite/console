<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { bucket } from './store';

    export let showDelete = false;

    const deleteUser = async () => {
        try {
            await sdk.forProject.storage.deleteBucket($bucket.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$bucket.name} has been deleted`
            });
            await goto(`${base}/console/project-${$page.params.project}/storage`);
            trackEvent(Submit.BucketDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BucketDelete);
        }
    };
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteUser}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteBucket()}</svelte:fragment>
    <p data-private>{$LL.console.project.texts.storage.deleteWarning()} <b>{$bucket.name}</b>?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
