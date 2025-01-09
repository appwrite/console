<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    const siteId = $page.params.site;

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
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SiteDelete);
        }
    };
</script>

<Modal
    title="Delete site"
    bind:show={showDelete}
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning">
    <p data-private>
        Are you sure you want to delete this site and all associated deployments from your
        project?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
