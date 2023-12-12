<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { webhook } from './store';

    export let show = false;
    const projectId = $page.params.project;

    async function regenerate() {
        try {
            await sdk.forConsole.projects.updateWebhookSignature(projectId, $webhook.$id);
            await invalidate(Dependencies.WEBHOOK);
            show = false;
            addNotification({
                type: 'success',
                message: 'Key has been regenerated'
            });
            trackEvent(Submit.WebhookUpdateSignature);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateSignature);
        }
    }
</script>

<Modal title="Regenerate Key" bind:show onSubmit={regenerate}>
    <p class="u-text">
        Are you sure you want to generate a new Signature Key?
        <b>You will not be able to recover the current key.</b>
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Regenerate</Button>
    </svelte:fragment>
</Modal>
