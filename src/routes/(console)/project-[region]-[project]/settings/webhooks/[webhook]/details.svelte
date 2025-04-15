<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import Button from '$lib/elements/forms/button.svelte';
    import { InputSwitch } from '$lib/elements/forms';
    import { webhook } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import FailedModal from '../failedModal.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import MessageStatusPill from '../messageStatusPill.svelte';
    import FormList from '$lib/elements/forms/formList.svelte';

    const projectId = $page.params.project;

    let enabled: boolean;

    onMount(async () => {
        enabled = $webhook.enabled;
    });

    let showFailed = false;

    async function setEnabled() {
        try {
            await sdk.forConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                $webhook.name,
                $webhook.events,
                $webhook.url,
                $webhook.security,
                enabled,
                $webhook.httpUser || undefined,
                $webhook.httpPass || undefined
            );
            await invalidate(Dependencies.WEBHOOK);
            addNotification({
                type: 'success',
                message: 'Webhook has been ' + (enabled ? 'enabled' : 'disabled')
            });
            trackEvent(Submit.WebhookUpdateEnabled);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateEnabled);
        }
    }
</script>

<CardGrid>
    <Heading tag="h2" size="7">{$webhook.url}</Heading>

    <svelte:fragment slot="aside">
        <div class="u-flex u-gap-16">
            <ul class="u-stretch">
                <FormList>
                    <InputSwitch
                        label={enabled ? 'Enabled' : 'Disabled'}
                        id="enable-switch"
                        bind:value={enabled} />
                </FormList>

                <li style="margin-top:16px">Created: {toLocaleDateTime($webhook.$createdAt)}</li>
                <li>Last updated: {toLocaleDateTime($webhook.$updatedAt)}</li>
            </ul>
            <MessageStatusPill enabled={$webhook.enabled} />
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <div class="u-flex u-gap-16">
            {#if $webhook.logs.length > 0}
                <Button on:click={() => (showFailed = true)} secondary>View logs</Button>
            {/if}

            <Button on:click={setEnabled} disabled={enabled === $webhook.enabled} submit
                >Update</Button>
        </div>
    </svelte:fragment>
</CardGrid>

<FailedModal bind:show={showFailed} webhook={$webhook} showUpdateButton={false} />
