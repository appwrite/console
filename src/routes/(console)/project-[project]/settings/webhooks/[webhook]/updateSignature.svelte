<script lang="ts">
    import { CardGrid, Secret } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Link } from '@appwrite.io/pink-svelte';
    import Regenerate from './regenerate.svelte';
    import { webhook } from './store';
    import { Click, trackEvent } from '$lib/actions/analytics';

    let showRegenerate = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Signature key</svelte:fragment>
    Add the Signature Key to the X-Appwrite-Webhook-Signature header to validate your webhooks.
    <Link.Anchor
        href="https://appwrite.io/docs/advanced/platform/webhooks#verification"
        target="_blank"
        rel="noopener noreferrer"
        class="link">Learn more</Link.Anchor>
    <svelte:fragment slot="aside">
        <div>
            <Secret label="Key" copyEvent="signature" bind:value={$webhook.signatureKey} />
        </div>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button
            on:click={() => {
                showRegenerate = true;
                trackEvent(Click.SettingsWebhookUpdateSignatureClick);
            }}
            secondary
            submit>Regenerate key</Button>
    </svelte:fragment>
</CardGrid>

<Regenerate bind:show={showRegenerate} />
