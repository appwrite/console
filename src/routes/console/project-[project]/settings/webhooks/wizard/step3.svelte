<script lang="ts">
    import { FormList, InputText, InputPassword, InputChoice } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createWebhook } from './store';
    import LL from '$i18n/i18n-svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >{$LL.console.project.legends.settings.webhooks.security()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.forms.settings.webhooks.texts.security()}
    </svelte:fragment>
    <FormList>
        <div>
            <h2 class="heading-level-7">{$LL.console.project.title.httpAuth()}</h2>
            <p class="text">
                {$LL.console.project.forms.settings.webhooks.texts.secureEndpoints()}
            </p>
        </div>
        <InputText
            label={$LL.console.project.forms.settings.webhooks.inputs.user.label()}
            id="user"
            placeholder={$LL.console.project.forms.settings.webhooks.inputs.user.placeholder()}
            bind:value={$createWebhook.httpUser} />
        <InputPassword
            label={$LL.console.project.forms.settings.webhooks.inputs.password.label()}
            id="password"
            showPasswordButton
            placeholder={$LL.console.project.forms.settings.webhooks.inputs.password.placeholder()}
            minlength={0}
            bind:value={$createWebhook.httpPass} />

        <InputChoice
            id="Security"
            label="Certificate verification (SSL/TLS)"
            bind:value={$createWebhook.security}>
            <span class="u-color-text-danger">Warning:</span>
            {$LL.console.project.forms.settings.webhooks.texts.untrustedCertificate()}
            <a
                href="https://appwrite.io/docs/custom-domains#enjoySSLCert"
                target="_blank"
                rel="noopener noreferrer"
                class="link">
                {$LL.console.project.forms.settings.webhooks.texts.learnMoreWarning()}</a
            ></InputChoice>
    </FormList>
</WizardStep>
