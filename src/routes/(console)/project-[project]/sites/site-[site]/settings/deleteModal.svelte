<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import Confirm from '$lib/components/confirm.svelte';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    const siteId = $page.params.site;
    let error: string;
    const handleSubmit = async () => {
        try {
            await sdk.forProject.sites.delete(siteId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Site has been deleted`
            });
            await goto(`${base}/project-${$page.params.project}/sites`);
            trackEvent(Submit.SiteDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.SiteDelete);
        }
    };
</script>

<Confirm onSubmit={handleSubmit} title="Delete site" bind:open={showDelete} bind:error>
    Are you sure you want to delete this site and all associated deployments from your project?
</Confirm>
