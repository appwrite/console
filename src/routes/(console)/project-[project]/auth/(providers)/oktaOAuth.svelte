<script lang="ts">
    import { page } from '$app/state';
    import { CopyInput, Modal } from '$lib/components';
    import { Button, InputPassword, InputSwitch, InputText } from '$lib/elements/forms';
    import { oAuthProviders, type Provider } from '$lib/stores/oauth-providers';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { updateOAuth } from '../updateOAuth';
    import type { Models } from '@appwrite.io/console';
    import { Alert } from '@appwrite.io/pink-svelte';

    const projectId = page.params.project;

    export let provider: Models.AuthProvider;
    export let show = false;

    let appId: string = null;
    let enabled: boolean = null;
    let clientSecret: string = null;
    let oktaDomain: string = null;
    let authorizationServerId: string = null;
    let error: string;
    let oAuthProvider: Provider;

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;
        if (provider.secret) {
            ({ clientSecret, oktaDomain, authorizationServerId } = JSON.parse(provider.secret));
        }
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
        clientSecret && oktaDomain && authorizationServerId
            ? JSON.stringify({ clientSecret, oktaDomain, authorizationServerId })
            : provider.secret;
</script>

<Modal {error} onSubmit={update} size="l" bind:show on:close>
    <svelte:fragment slot="title">{provider.name} OAuth2 settings</svelte:fragment>
    <p>
        To use {provider.name} authentication in your application, first fill in this form. For more
        info you can
        <a class="link" href={oAuthProvider?.docs} target="_blank" rel="noopener noreferrer"
            >visit the docs.</a>
    </p>
    <InputSwitch id="state" bind:value={enabled} label={enabled ? 'Enabled' : 'Disabled'} />
    <InputText
        id="appID"
        label="Client ID"
        autofocus={true}
        placeholder="Enter ID"
        bind:value={appId} />
    <InputPassword
        id="secret"
        label="Client Secret"
        placeholder="Enter Client Secret"
        minlength={0}
        bind:value={clientSecret} />
    <InputText
        id="domain"
        label="Okta Domain"
        placeholder="dev-1337.okta.com"
        bind:value={oktaDomain} />
    <InputText
        id="serverID"
        label="Authorization Server ID"
        placeholder="default"
        bind:value={authorizationServerId} />

    <Alert.Inline status="info">
        To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
    </Alert.Inline>
    <div>
        <p>URI</p>
        <CopyInput
            value={`${sdk.forConsole.client.config.endpoint}/account/sessions/oauth2/callback/${provider.key}/${projectId}`} />
    </div>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button
            disabled={(secret === provider.secret &&
                enabled === provider.enabled &&
                appId === provider.appId) ||
                !(appId && clientSecret && oktaDomain && authorizationServerId)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
