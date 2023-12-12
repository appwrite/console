<script lang="ts">
    import { CardGrid, Heading, Secret } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import Regenerate from './regenerate.svelte';
    import { webhook } from './store';

    let showRegenerate = false;
</script>

<CardGrid>
    <Heading tag="h2" size="7">Signature key</Heading>
    <p>
        Add the Signature Key to the X-Appwrite-Webhook-Signature header to validate your webhooks. <a
            href="https://appwrite.io/docs/advanced/platform/webhooks#verification"
            target="_blank"
            rel="noopener noreferrer"
            class="link">Learn more about webhook validation.</a>
    </p>
    <svelte:fragment slot="aside">
        <div>
            <p>Key</p>
            <Secret copyEvent="signature" bind:value={$webhook.signatureKey} />
        </div>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button on:click={() => (showRegenerate = true)} secondary submit>Regenerate Key</Button>
    </svelte:fragment>
</CardGrid>

<Regenerate bind:show={showRegenerate} />
