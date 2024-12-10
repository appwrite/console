<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { key } from './store';

    export let showDelete = false;

    async function handleDelete() {
        try {
            await sdk.forConsole.projects.deleteKey($project.$id, $key.$id);
            await invalidate(Dependencies.KEYS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$key.name} has been deleted`
            });
            trackEvent(Submit.KeyDelete);
            await goto(`${base}/project-${$project.region}-${$project.$id}/overview/keys`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyDelete);
        }
    }
</script>

<Modal
    title="Delete API key"
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p>The API key will be permanently deleted. This action is irreversible.</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
