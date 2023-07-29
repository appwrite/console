<script lang="ts">
    import { InputText, InputURL, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createWebhook } from './store';
    import LL from '$i18n/i18n-svelte';
    //TODO: Create InputURL component
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >{$LL.console.project.legends.settings.webhooks.addWebhooks()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.forms.settings.webhooks.texts.stepOne()}
    </svelte:fragment>
    <FormList>
        <InputText
            label={$LL.console.project.forms.settings.webhooks.inputs.name.label()}
            id="name"
            placeholder={$LL.console.project.forms.settings.webhooks.inputs.name.defaultPlaceholder()}
            bind:value={$createWebhook.name}
            required />
        <InputURL
            label={$LL.console.project.forms.settings.webhooks.inputs.url.label()}
            id="url"
            placeholder="https://example.com/callback"
            bind:value={$createWebhook.url}
            required />
    </FormList>
</WizardStep>
