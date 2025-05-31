<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { platform } from './store';

    export let showDelete = false;
    let error: string;
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
        } catch (e) {
            error = e.message;
            trackError(e, Submit.PlatformDelete);
        }
    }
</script>

<Confirm onSubmit={handleDelete} title="Delete platform" bind:open={showDelete} bind:error>
    The Platform will be permanently deleted. This action is irreversible.
</Confirm>
