<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { devKey } from './store';

    export let showDelete = false;
    let error: string;

    async function handleDelete() {
        try {
            await sdk.forConsole.projects.deleteDevKey($project.$id, $devKey.$id);
            await invalidate(Dependencies.DEV_KEYS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$devKey.name} has been deleted`
            });
            trackEvent(Submit.DevKeyDelete);
            await goto(`${base}/project-${$project.$id}/overview/dev-keys`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DevKeyDelete);
        }
    }
</script>

<Confirm onSubmit={handleDelete} title="Delete Dev key" bind:open={showDelete} bind:error>
    Are you sure you want to delete this Dev key?
</Confirm>
