<script lang="ts">
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import ExpirationInput from '../expirationInput.svelte';
    import { key } from './store';
    import { isStandardApiKey } from '../../store';

    const keyTypeName = $isStandardApiKey ? 'API' : 'Dev';
</script>

<WizardStep>
    <svelte:fragment slot="title">{keyTypeName} key</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {#if $isStandardApiKey}
            Generate API keys to authenticate your application. While still in development, use Dev
            keys instead, as they're better suited for debugging.
        {:else}
            Test your app without rate limits and more detailed error messages.
        {/if}
    </svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="{keyTypeName} key name"
            required
            bind:value={$key.name} />
        <ExpirationInput bind:value={$key.expire} isStandardApiKey={$isStandardApiKey} />
    </FormList>
</WizardStep>
