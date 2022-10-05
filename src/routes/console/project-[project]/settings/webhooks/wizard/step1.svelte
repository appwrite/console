<script lang="ts">
    import { InputText, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createWebhook } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Add your webhook</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Use webhooks to build integrations that subscribe to specific events on Appwrite. Appwrite
        will send an HTTP POST payload to the webhook's configured URL when one of the specified
        events is triggered.
    </svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Enter name"
            bind:value={$createWebhook.name}
            required />
        <InputText
            label="POST URL"
            id="url"
            placeholder="https://example.com/callback"
            bind:value={$createWebhook.url}
            required />
    </FormList>
</WizardStep>
