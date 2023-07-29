<script lang="ts">
    import { CardGrid, Heading, Secret } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import Regenerate from './regenerate.svelte';
    import { webhook } from './store';
    import LL from '$i18n/i18n-svelte';

    let showRegenerate = false;
</script>

<CardGrid>
    <Heading tag="h2" size="7">{$LL.console.project.title.signatureKey()}</Heading>
    <p>
        {$LL.console.project.texts.webhooks.addSignature()}
        <a
            href="https://appwrite.io/docs/webhooks#verification"
            target="_blank"
            rel="noopener noreferrer"
            class="link">{$LL.console.project.texts.webhooks.webhookValidation()}</a>
    </p>
    <svelte:fragment slot="aside">
        <div>
            <p>Key</p>
            <Secret copyEvent="signature" bind:value={$webhook.signatureKey} />
        </div>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button on:click={() => (showRegenerate = true)} secondary submit
            >{$LL.console.project.button.submit.regenerateKey()}</Button>
    </svelte:fragment>
</CardGrid>

<Regenerate bind:show={showRegenerate} />
