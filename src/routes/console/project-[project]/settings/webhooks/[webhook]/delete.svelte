<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { webhook } from './store';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;

    async function handleDelete() {
        try {
            await sdk.forConsole.projects.deleteWebhook($project.$id, $webhook.$id);
            await invalidate(Dependencies.WEBHOOKS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$webhook.name} ${$LL.components.notification.hasBeenDeleted()}`
            });
            trackEvent(Submit.WebhookDelete);
            await goto(`${base}/console/project-${$project.$id}/settings/webhooks`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookDelete);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteWebhook()}</svelte:fragment>
    <p data-private>
        {$LL.console.project.texts.webhooks.delete.phraseOne()}{' '}<b>{$webhook.name}</b
        >{' '}{$LL.console.project.texts.webhooks.delete.from()}{' '}'{$project.name}'?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
