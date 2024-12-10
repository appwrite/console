<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { func } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let selectedDeployment: Models.Deployment = null;
    let error: string;

    async function redeploy() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.createBuild(
                    $func.$id,
                    selectedDeployment.$id,
                    selectedDeployment.buildId
                );
            addNotification({
                type: 'success',
                message: `Redeploying ${$func.name}`
            });
            trackEvent(Submit.FunctionRedeploy);

            invalidate(Dependencies.FUNCTION);
            invalidate(Dependencies.DEPLOYMENTS);
            show = false;
        } catch (e) {
            error = e.message;

            trackError(e, Submit.FunctionRedeploy);
        }
    }
</script>

<Modal
    title="Redeploy function"
    size="big"
    bind:show
    bind:error
    onSubmit={redeploy}
    headerDivider={false}>
    <p class="text">
        Are you sure you want to redeploy <b>{$func.name}</b>? Redeploying may affect your
        production code.
    </p>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Redeploy</Button>
    </svelte:fragment>
</Modal>
