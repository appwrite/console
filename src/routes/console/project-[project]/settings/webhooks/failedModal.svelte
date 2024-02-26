<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    import Code from '$lib/components/code.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';

    export let show: boolean;
    export let webhook: { [key: string | number]: string | number | boolean };

    const projectId = $page.params.project;
    const webhookPath = `${base}/console/project-${projectId}/settings/webhooks/${webhook.$id}`;
</script>

<Modal title="Webhook error" headerDivider={false} bind:show size="big">
    <div class="box u-flex-vertical u-gap-24">
        <div class="u-inline-flex u-cross-center u-gap-8">
            <p class="u-stretch">
                <span
                    class="icon-exclamation-circle u-font-size-20"
                    aria-hidden="true"
                    style="color:hsl(var(--color-danger-100));" />
                <span>Webhook {webhook.enabled ? 'enabled' : 'disabled'}</span>
            </p>

            <Button secondary href={webhookPath} event="update_webhook">Update Webhook</Button>
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
