<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Alert, Link } from '@appwrite.io/pink-svelte';
    import Regenerate from './regenerate.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    let showRegenerate = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Webhook secret</svelte:fragment>
    Used to validate incoming webhook payloads with the `X-Appwrite-Webhook-Signature` header.
    <Link.Anchor
        href="https://appwrite.io/docs/advanced/platform/webhooks#verification"
        target="_blank"
        rel="noopener noreferrer"
        class="link">Learn more</Link.Anchor>
    <svelte:fragment slot="aside">
        <Alert.Inline status="info">
            This secret is only shown once after webhook creation or secret rotation.
        </Alert.Inline>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button
            on:click={() => {
                showRegenerate = true;
                trackEvent(Click.SettingsWebhookUpdateSignatureClick);
            }}
            secondary
            submit>Rotate secret</Button>
    </svelte:fragment>
</CardGrid>

<Regenerate bind:show={showRegenerate} />
