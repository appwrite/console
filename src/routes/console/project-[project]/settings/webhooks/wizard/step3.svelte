<script lang="ts">
    import { FormList, InputText, InputPassword } from '$lib/elements/forms';
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
            label="Name"
            id="name"
            placeholder="Enter username"
            bind:value={$createWebhook.httpUser}
            required />
        <InputPassword
            label="Password"
            id="password"
            placeholder="Enter password"
            bind:value={$createWebhook.httpPass}
            required />
    </FormList>
</WizardStep>
