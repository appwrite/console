<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Confirm } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let show = false;
    export let selectedDeploymentId: string;
    export let siteId: string;
    let error: string;

    async function activate() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .sites.updateSiteDeployment(siteId, selectedDeploymentId);
            addNotification({
                type: 'success',
                message: `Deployment has been activated`
            });
            trackEvent(Submit.SiteActivateDeployment);

            invalidate(Dependencies.SITE);
            invalidate(Dependencies.DEPLOYMENTS);
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.SiteActivateDeployment);
        }
    }
</script>

<Confirm title="Activate deployment" bind:open={show} bind:error onSubmit={activate}>
    <p class="text">
        This deployment is ready but not yet live. Activate it to make it publicly accessible.
    </p>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Activate</Button>
    </svelte:fragment>
</Confirm>
