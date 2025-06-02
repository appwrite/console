<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Confirm } from '$lib/components';
    import { func } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { base } from '$app/paths';

    export let show = false;
    export let selectedDeployment: Models.Deployment = null;
    export let redirect = false;
    let error: string;

    async function redeploy() {
        try {
            const deployment = await sdk
                .forProject(page.params.region, page.params.project)
                .functions.createDuplicateDeployment(
                    $func.$id,
                    selectedDeployment.$id,
                    selectedDeployment?.buildId || undefined
                );

            trackEvent(Submit.FunctionRedeploy);

            invalidate(Dependencies.FUNCTION);
            invalidate(Dependencies.DEPLOYMENTS);
            show = false;
            addNotification({
                type: 'success',
                message: `Redeploying ${$func.name}`
            });
            if (redirect) {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/functions/function-${$func.$id}/deployments/deployment-${deployment.$id}`
                );
            }
        } catch (e) {
            error = e.message;

            trackError(e, Submit.FunctionRedeploy);
        }
    }
</script>

<Confirm title="Redeploy function" bind:open={show} bind:error onSubmit={redeploy}>
    <p class="text">
        Are you sure you want to redeploy <b>{$func.name}</b>? Redeploying may affect your
        production code.
    </p>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Redeploy</Button>
    </svelte:fragment>
</Confirm>
