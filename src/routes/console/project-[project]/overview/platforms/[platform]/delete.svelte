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

    const handleDelete = async () => {
        try {
            await sdk.forConsole.projects.deletePlatform($project.$id, $platform.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$platform.name} has been deleted`
            });
            trackEvent(Submit.PlatformDelete);
            await invalidate(Dependencies.PLATFORMS);
            await goto(`${base}/console/project-${$project.$id}/overview/platforms`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.PlatformDelete);
        }
    };
</script>

<Modal bind:show={showDelete} onSubmit={handleDelete} warning>
    <svelte:fragment slot="header">Delete Platform</svelte:fragment>
    <p>The Platform will be permanently deleted. This action is irreversible.</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
