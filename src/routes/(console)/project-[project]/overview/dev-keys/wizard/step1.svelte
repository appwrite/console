<script lang="ts">
    import { devKey } from '../../store';
    import { WizardStep } from '$lib/layout';
    import { FormList, InputText } from '$lib/elements/forms';
    import ExpirationInput from '../../components/expirationInput.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">Dev key</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Test your app without rate limits and more detailed error messages.
    </svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="Dev key name"
            required
            bind:value={$devKey.name} />
        <ExpirationInput bind:value={$devKey.expire} resourceType="Dev" />
    </FormList>
</WizardStep>
