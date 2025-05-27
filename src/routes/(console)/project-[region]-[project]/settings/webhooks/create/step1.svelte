<script lang="ts">
    import { InputText, InputURL } from '$lib/elements/forms';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';

    export let name: string;
    export let url: string;
</script>

<Fieldset legend="Configuration">
    <Layout.Stack gap="s">
        <InputText label="Name" id="name" placeholder="Enter name" bind:value={name} required />
        <InputURL
            label="POST URL"
            id="url"
            placeholder="https://example.com/callback"
            bind:value={url}
            required />
    </Layout.Stack>
</Fieldset>
