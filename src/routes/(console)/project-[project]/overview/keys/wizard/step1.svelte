<script lang="ts">
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import ExpirationInput from '../expirationInput.svelte';
    import { key } from './store';
    import { isStandardApiKey } from '../../store';
</script>

<WizardStep>
    <svelte:fragment slot="title">{$isStandardApiKey ? 'API' : 'Dev'} key</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {#if $isStandardApiKey}
            Generate API keys to authenticate your application.
        {:else}
            Generate Dev keys for improved debugging while still developing.
        {/if}
    </svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="{$isStandardApiKey ? 'API' : 'Dev'} key name"
            required
            bind:value={$key.name} />
        <ExpirationInput bind:value={$key.expire} />
    </FormList>
</WizardStep>
