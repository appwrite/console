<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { func } from '../store';
    import Confirm from '$lib/components/confirm.svelte';
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    export let selectedExecution: Models.Execution;

    let error: string;

    async function handleSubmit() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.deleteExecution($func.$id, selectedExecution.$id);
            await invalidate(Dependencies.EXECUTIONS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Execution has been deleted`
            });
            trackEvent(Submit.ExecutionDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ExecutionDelete);
        }
    }
</script>

<Confirm onSubmit={handleSubmit} title="Delete execution" bind:open={showDelete} bind:error>
    Are you sure you want to delete this execution?
</Confirm>
