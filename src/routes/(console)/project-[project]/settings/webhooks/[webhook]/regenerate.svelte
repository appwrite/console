<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { webhook } from './store';

    export let show = false;
    const projectId = page.params.project;

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

<Confirm title="Regenerate Key" bind:open={show} onSubmit={regenerate} action="Regenerate">
    Are you sure you want to generate a new Signature key?
    <b>You will not be able to recover the current key.</b>
</Confirm>
