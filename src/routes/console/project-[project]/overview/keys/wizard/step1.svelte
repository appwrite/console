<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import ExpirationInput from '../expirationInput.svelte';
    import { key } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">{$LL.console.project.title.createApiKey()}</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >{$LL.console.project.texts.overview.createApiKey()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.project.forms.overview.inputs.name.label()}
            placeholder={$LL.console.project.forms.overview.inputs.name.placeholder()}
            required
            bind:value={$key.name} />
        <ExpirationInput bind:value={$key.expire} />
    </FormList>
</WizardStep>
