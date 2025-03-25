<script lang="ts">
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import ExpirationInput from '../expirationInput.svelte';
    import { key } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">API key</svelte:fragment>
    <svelte:fragment slot="subtitle">Let's create an API key.</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="API key name"
            required
            bind:value={$key.name} />
        <ExpirationInput bind:value={$key.expire} />
    </FormList>
</WizardStep>
