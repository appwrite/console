<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    export let selectedDeployment: Models.Deployment = null;
    let error: string;

    async function handleSubmit() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.deleteDeployment({
                    functionId: selectedDeployment.resourceId,
                    deploymentId: selectedDeployment.$id
                });
            if (page.route.id?.includes('deployment-[deployment]')) {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/deployments`
                );
                return;
            }
            await invalidate(Dependencies.FUNCTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Deployment has been deleted`
            });
            trackEvent(Submit.DeploymentDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DeploymentDelete);
        }
    }
</script>

<Confirm onSubmit={handleSubmit} title="Delete deployment" bind:open={showDelete} bind:error>
    Are you sure you want to delete this deployment?
</Confirm>
