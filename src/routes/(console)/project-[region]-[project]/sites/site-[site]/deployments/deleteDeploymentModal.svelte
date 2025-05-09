<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let showDelete = false;
    export let selectedDeployment: Models.Deployment = null;
    export let activeDeployment: string;

    let error: string;

    async function handleSubmit() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .sites.deleteDeployment(selectedDeployment.resourceId, selectedDeployment.$id);
            await invalidate(Dependencies.SITE);
            if (page.url.href.includes(`deployment-${selectedDeployment.$id}`)) {
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/deployments`
                );
            }
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

<Confirm
    onSubmit={handleSubmit}
    title="Delete deployment"
    bind:open={showDelete}
    bind:error
    confirmDeletion={activeDeployment === selectedDeployment.$id}>
    <Typography.Text>Are you sure you want to delete this deployment?</Typography.Text>
    {#if activeDeployment === selectedDeployment.$id}
        <Typography.Text>
            Your site will no longer be available until you redeploy. This action is irreversible.
        </Typography.Text>
    {/if}
</Confirm>
