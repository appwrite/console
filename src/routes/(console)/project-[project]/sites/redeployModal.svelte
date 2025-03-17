<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Confirm } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let selectedDeploymentId: string;
    export let site: Models.Site;
    let error: string;

    async function redeploy() {
        try {
            sdk.forProject.sites.createDuplicateDeployment(site.$id, selectedDeploymentId);
            addNotification({
                type: 'success',
                message: `Redeploying ${site.name}`
            });
            trackEvent(Submit.SiteRedeploy);

            invalidate(Dependencies.SITE);
            invalidate(Dependencies.DEPLOYMENTS);
            show = false;
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
