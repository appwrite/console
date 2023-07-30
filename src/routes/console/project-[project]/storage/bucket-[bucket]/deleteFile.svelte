<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let file: Models.File;
    export let showDelete = false;

    const dispatch = createEventDispatcher();

    const deleteFile = async () => {
        try {
            await sdk.forProject.storage.deleteFile(file.bucketId, file.$id);
            showDelete = false;
            dispatch('deleted', file);
            addNotification({
                type: 'success',
                message: `${file.name} has been deleted`
            });
            trackEvent(Submit.FileDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FileDelete);
        }
    };
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteFile}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteFile()}</svelte:fragment>
    <p data-private>{$LL.console.project.texts.storage.deleteWarning()} <b>{file.name}</b>?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
