<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { key } from './store';

    export let showDelete = false;
    let error: string;

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
            await goto(`${base}/project-${$project.$id}/overview/keys`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.KeyDelete);
        }
    }
</script>

<Confirm onSubmit={handleDelete} title="Delete API key" bind:open={showDelete} bind:error>
    Are you sure you want to delete this execution?
</Confirm>
