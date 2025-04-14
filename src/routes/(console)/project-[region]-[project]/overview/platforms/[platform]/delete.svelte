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
    import { platform } from './store';

    export let showDelete = false;

    async function handleDelete() {
        try {
            await sdk.forConsole.projects.deletePlatform($project.$id, $platform.$id);
            await invalidate(Dependencies.PLATFORMS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$platform.name} has been deleted`
            });
            trackEvent(Submit.PlatformDelete);
            await goto(`${base}/project-${$project.region}-${$project.$id}/overview/platforms`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.PlatformDelete);
        }
    }
</script>

<Modal
    title="Delete platform"
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p>The Platform will be permanently deleted. This action is irreversible.</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
