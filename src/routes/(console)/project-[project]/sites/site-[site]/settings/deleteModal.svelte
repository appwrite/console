<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { FormList } from '$lib/elements/forms/index.js';

    export let siteName = '';
    export let showDelete = false;
    const siteId = $page.params.site;

    let confirmedDeletion = false;

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
    <FormList>
        <p data-private>Are you sure you want to delete <b>{siteName}</b>?</p>
        <p data-private>
            The site and all associated deployments will be permanently deleted. This action is
            irreversible.
        </p>

        <div class="input-check-box-friction">
            <InputCheckbox
                required
                size="s"
                id="delete_policy"
                bind:checked={confirmedDeletion}
                label="I understand and confirm" />
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit disabled={!confirmedDeletion}>Delete</Button>
    </svelte:fragment>
</Modal>
