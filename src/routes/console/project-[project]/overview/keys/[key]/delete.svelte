<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { key } from './store';

    export let showDelete = false;

    async function handleDelete() {
        try {
            await sdkForConsole.projects.deleteKey($project.$id, $key.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$key.name} has been deleted`
            });
            trackEvent(Submit.KeyDelete);
            await invalidate(Dependencies.KEYS);
            await goto(`${base}/console/project-${$project.$id}/overview/keys`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyDelete);
        }
    }
</script>

<Modal bind:show={showDelete} on:submit={handleDelete} warning>
    <svelte:fragment slot="header">Delete API Key</svelte:fragment>
    <p>The API Key will be permanently deleted. This action is irreversible.</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
