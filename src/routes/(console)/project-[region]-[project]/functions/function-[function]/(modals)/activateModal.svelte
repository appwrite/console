<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Confirm } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/state';

    export let showActivate = false;
    export let selectedDeployment: Models.Deployment = null;
    let error = null;
    const dispatch = createEventDispatcher();

    const handleSubmit = async () => {
        try {
<<<<<<<< HEAD:src/routes/(console)/project-[region]-[project]/functions/function-[function]/(modals)/activateModal.svelte
            await sdk.forProject(page.params.region, page.params.project).functions.updateFunctionDeployment(
                selectedDeployment.resourceId,
                selectedDeployment.$id
            );
========
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.updateDeployment(selectedDeployment.resourceId, selectedDeployment.$id);
>>>>>>>> 93754b342accbdb6db066c33b2addea7b9e92d67:src/routes/(console)/project-[region]-[project]/functions/function-[function]/activate.svelte
            showActivate = false;
            addNotification({
                type: 'success',
                message: `Deployment has been activated`
            });
            dispatch('activated');
            trackEvent(Submit.DeploymentUpdate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DeploymentUpdate);
        }
    };

    $: if (!showActivate) {
        error = null;
    }
</script>

<Confirm title="Activate deployment" bind:open={showActivate} onSubmit={handleSubmit} bind:error>
    <p>This deployment is ready but not yet live. Activate it to make it publicly accessible.</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showActivate = false)}>Cancel</Button>
        <Button submit>Activate</Button>
    </svelte:fragment>
</Confirm>
