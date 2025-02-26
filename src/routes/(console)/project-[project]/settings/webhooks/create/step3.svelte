<script lang="ts">
    import { InputText, InputPassword, InputChoice } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    export let httpUser: string;
    export let httpPass: string;
    export let security: boolean;
</script>

<WizardStep>
    <svelte:fragment slot="title">Security</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set an optional basic HTTP authentication username and password to protect your endpoint
        from unauthorized access.
    </svelte:fragment>
    <div>
        <h2 class="heading-level-7">HTTP Authentication</h2>
        <p class="text">Use to secure your endpoint from untrusted sources.</p>
    </div>
    <InputText label="User" id="user" placeholder="Enter username" bind:value={httpUser} />
    <InputPassword
        label="Password"
        id="password"
        placeholder="Enter password"
        minlength={0}
        bind:value={httpPass} />
    <InputChoice id="Security" label="Certificate verification (SSL/TLS)" bind:value={security}>
        <span class="u-color-text-danger">Warning:</span> Untrusted or self-signed certificates may
        not be secure.
        <a
            href="https://appwrite.io/docs/advanced/self-hosting/tls-certificates"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            Learn more</a
        ></InputChoice>
</WizardStep>
