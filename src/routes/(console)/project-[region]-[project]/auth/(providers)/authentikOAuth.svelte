<script lang="ts">
    import { page } from '$app/stores';
    import { Alert, CopyInput, Modal } from '$lib/components';
    import { Button, FormList, InputPassword, InputSwitch, InputText } from '$lib/elements/forms';
    import { oAuthProviders, type Provider } from '$lib/stores/oauth-providers';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { updateOAuth } from '../updateOAuth';
    import type { Models } from '@appwrite.io/console';

    const projectId = $page.params.project;

    export let provider: Models.AuthProvider;
    export let show = false;

    let appId: string = null;
    let enabled: boolean = null;
    let clientSecret: string = null;
    let authentikDomain: string = null;
    let error: string;
    let oAuthProvider: Provider;

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;
        if (provider.secret) ({ clientSecret, authentikDomain } = JSON.parse(provider.secret));
        oAuthProvider = oAuthProviders[provider.key];
    });

    const update = async () => {
        const result = await updateOAuth({ projectId, provider, secret, appId, enabled });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };

    $: secret =
        clientSecret && authentikDomain
            ? JSON.stringify({ clientSecret, authentikDomain })
            : provider.secret;
</script>

<Modal {error} size="big" bind:show onSubmit={update} on:close>
    <svelte:fragment slot="title">{provider.name} OAuth2 Settings</svelte:fragment>
    <FormList>
        <p>
            To use {provider.name} authentication in your application, first fill in this form. For more
            info you can
            <a class="link" href={oAuthProvider?.docs} target="_blank" rel="noopener noreferrer"
                >visit the docs.</a>
        </p>
        <InputSwitch id="state" bind:value={enabled} label={enabled ? 'Enabled' : 'Disabled'} />
        <InputText
            id="clientID"
            label="Client ID"
            autofocus={true}
            placeholder="Enter ID"
            bind:value={appId} />
        <InputPassword
            id="secret"
            label="Client Secret"
            placeholder="Enter Client Secret"
            minlength={0}
            showPasswordButton
            bind:value={clientSecret} />
        <InputText
            id="domain"
            label="Authentik Base-Domain"
            placeholder="Your Authentik domain"
            bind:value={authentikDomain} />
        <Alert type="info">
            To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
        </Alert>
        <div>
            <p>URI</p>
            <CopyInput
                value={`${sdk.forConsole.client.config.endpoint}/account/sessions/oauth2/callback/${provider.key}/${projectId}`} />
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button
            disabled={(secret === provider.secret &&
                enabled === provider.enabled &&
                appId === provider.appId) ||
                !(appId && clientSecret && authentikDomain)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
