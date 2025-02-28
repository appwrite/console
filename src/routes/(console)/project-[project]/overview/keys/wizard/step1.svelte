<script lang="ts">
    import { apiKey } from '../../store';
    import { WizardStep } from '$lib/layout';
    import { FormList, InputText } from '$lib/elements/forms';
    import ExpirationInput from '../../components/expirationInput.svelte';
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
            bind:value={$apiKey.name} />
        <ExpirationInput bind:value={$apiKey.expire} />
    </FormList>
</WizardStep>
