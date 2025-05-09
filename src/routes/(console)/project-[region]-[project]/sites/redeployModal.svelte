<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Confirm } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import { base } from '$app/paths';
    import { page } from '$app/state';

    export let show = false;
    export let selectedDeploymentId: string;
    export let site: Models.Site;
    export let redirect = false;
    let error: string;

    async function redeploy() {
        try {
            const deployment = await sdk
                .forProject(page.params.region, page.params.project)
                .sites.createDuplicateDeployment(site.$id, selectedDeploymentId);
            addNotification({
                type: 'success',
                message: `Redeploying ${site.name}`
            });
            trackEvent(Submit.SiteRedeploy);

            await invalidate(Dependencies.SITE);
            await invalidate(Dependencies.DEPLOYMENTS);
            show = false;
            if (redirect) {
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/sites/site-${site.$id}/deployments/deployment-${deployment.$id}`
                );
            }
        } catch (e) {
            error = e.message;
            trackError(e, Submit.SiteRedeploy);
        }
    }
</script>

<Confirm title="Redeploy site" bind:open={show} bind:error onSubmit={redeploy}>
    <p class="text">
        Are you sure you want to redeploy <b>{site.name}</b>? It may affect your production code.
    </p>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Redeploy</Button>
    </svelte:fragment>
</Confirm>
