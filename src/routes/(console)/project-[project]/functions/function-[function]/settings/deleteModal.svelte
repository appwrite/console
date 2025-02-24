<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    const functionId = $page.params.function;
    let error: string;
    const handleSubmit = async () => {
        try {
            await sdk.forProject.functions.delete(functionId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Function has been deleted`
            });
            await goto(`${base}/project-${$page.params.project}/functions`);
            trackEvent(Submit.FunctionDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.FunctionDelete);
        }
    };
</script>

<Confirm onSubmit={handleSubmit} title="Delete function" bind:open={showDelete} bind:error>
    Are you sure you want to delete this function and all associated deployments from your project?
</Confirm>
