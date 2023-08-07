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
    import LL from '$i18n/i18n-svelte';

    export let show = false;
    const projectId = $page.params.project;

    async function regenerate() {
        try {
            await sdk.forConsole.projects.updateWebhookSignature(projectId, $webhook.$id);
            await invalidate(Dependencies.WEBHOOK);
            show = false;
            addNotification({
                type: 'success',
                message: $LL.components.notification.keyRegenerated()
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

<Modal bind:show onSubmit={regenerate}>
    <svelte:fragment slot="header">{$LL.console.project.title.regenerateKey()}</svelte:fragment>
    <p class="u-text">
        {$LL.console.project.texts.webhooks.generateKey()}
        <b>{$LL.console.project.texts.webhooks.noRecoveryKey()}</b>
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.regenerate()}</Button>
    </svelte:fragment>
</Modal>
