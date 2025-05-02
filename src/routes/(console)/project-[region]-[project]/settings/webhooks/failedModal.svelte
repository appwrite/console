<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';

    import Code from '$lib/components/code.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { type Models } from '@appwrite.io/console';

    export let show: boolean;
    export let webhook: Models.Webhook;
    export let showUpdateButton: boolean = true;

    const projectId = page.params.project;

    $: webhookPath = webhook
        ? `${base}/project-${$page.params.region}-${projectId}/settings/webhooks/` +
          (webhook['$id'] ?? '')
        : '';

    let enabled = webhook ? webhook.enabled : false;

    $: style = `color: ${enabled ? 'hsl(var(--color-success-100))' : 'hsl(var(--color-danger-100))'}`;
    $: iconClass = enabled ? 'icon-check-circle' : 'icon-exclamation-circle';
</script>

<Modal title="Webhook error" bind:show>
    <div class="box u-flex-vertical u-gap-24">
        <div class="u-inline-flex u-cross-center u-gap-8">
            <p class="u-stretch">
                <span class={`${iconClass} u-font-size-20`} aria-hidden="true" {style}></span>
                <span>Webhook {webhook.enabled ? 'enabled' : 'disabled'}</span>
            </p>

            {#if showUpdateButton}
                <Button secondary href={webhookPath} event="update_webhook">Update webhook</Button>
            {/if}
        </div>

        <p>
            The connection to {webhook.url} stopped after {webhook.attempts} consecutive failures. Please
            refer to the logs below for more information or try to update the webhook to resolve this
            issue.
        </p>
        <div style="max-inline-size: 524px">
            <Code language="html" code={webhook.logs} noMargin noBoxPadding allowScroll />
        </div>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
