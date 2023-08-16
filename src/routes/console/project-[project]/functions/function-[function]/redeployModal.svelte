<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { func } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let selectedDeployment: Models.Deployment = null;

    async function redeploy() {
        try {
            await sdk.forProject.functions.createBuild(
                $func.$id,
                selectedDeployment.$id,
                selectedDeployment.buildId
            );
            addNotification({
                type: 'success',
                message: `${$func.name} has been redeployed.`
            });
            trackEvent(Submit.FunctionRedeploy);

            invalidate(Dependencies.DEPLOYMENTS);
            invalidate(Dependencies.FUNCTION);
            show = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionRedeploy);
        }
    }
</script>

<Modal size="big" bind:show onSubmit={redeploy} headerDivider={false}>
    <svelte:fragment slot="header">Redeploy function</svelte:fragment>
    <p class="text">
        Are you sure you want to redeploy <b>{$func.name}</b>? Redeploying may affect your
        production code.
    </p>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Redeploy</Button>
    </svelte:fragment>
</Modal>
