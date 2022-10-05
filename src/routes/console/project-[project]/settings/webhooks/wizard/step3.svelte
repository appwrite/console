<script lang="ts">
    import { FormList, InputText, InputPassword, InputChoice } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createWebhook } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Security (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set an optional basic HTTP authentication username and password to protect your endpoint
        from unauthorized access.
    </svelte:fragment>
    <FormList>
        <div>
            <h2 class="heading-level-7">HTTP Authentication</h2>
            <p class="text">Use to secure your endpoint from untrusted sources.</p>
        </div>
        <InputText
            label="User"
            id="user"
            placeholder="Enter username"
            bind:value={$createWebhook.httpUser} />
        <InputPassword
            label="Password"
            id="password"
            placeholder="Enter password"
            bind:value={$createWebhook.httpPass} />

        <InputChoice
            id="Security"
            label="Certificate verification (SSL/TLS)"
            bind:value={$createWebhook.security}>
            <span class="u-error">Warning:</span> Untrusted or self-signed certificates may not be
            secure.
            <a href="#/" target="_blank" rel="noopener noreferrer" class="link">
                Learn more</a
            ></InputChoice>
    </FormList>
</WizardStep>
