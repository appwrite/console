<script lang="ts">
    import { page } from '$app/state';
    import { CopyInput, Modal } from '$lib/components';
    import { Button, InputPassword, InputSwitch, InputText } from '$lib/elements/forms';
    import { oAuthProviders, type Provider } from '$lib/stores/oauth-providers';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
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
    let wellKnownEndpoint: string = null;
    let authorizationEndpoint: string = null;
    let tokenEndpoint: string = null;
    let userinfoEndpoint: string = null;
    let error: string;
    let oAuthProvider: Provider;

    // secret is valid if clientSecret is set and either wellKnownEndpoint or all of the other endpoints are set
    $: isValidSecret =
        clientSecret &&
        (wellKnownEndpoint || (authorizationEndpoint && tokenEndpoint && userinfoEndpoint));

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;
        if (provider.secret) {
            ({
                clientSecret,
                wellKnownEndpoint,
                authorizationEndpoint,
                tokenEndpoint,
                userinfoEndpoint
            } = JSON.parse(provider.secret));
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

    $: secret = isValidSecret
        ? JSON.stringify({
              clientSecret,
              wellKnownEndpoint,
              authorizationEndpoint,
              tokenEndpoint,
              userinfoEndpoint
          })
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
        id="well-known-endpoint"
        label="Well-Known Endpoint"
        placeholder="https://example.com/.well-known/openid-configuration"
        bind:value={wellKnownEndpoint} />
    <InputText
        id="authorization-endpoint"
        label="Authorization Endpoint"
        placeholder="https://example.com/authorize"
        bind:value={authorizationEndpoint} />
    <InputText
        id="token-endpoint"
        label="Token Endpoint"
        placeholder="https://example.com/token"
        bind:value={tokenEndpoint} />
    <InputText
        id="userinfo-endpoint"
        label="User Info Endpoint"
        placeholder="https://example.com/userinfo"
        bind:value={userinfoEndpoint} />

    <Alert.Inline status="info">
        To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
    </Alert.Inline>
    <div>
        <p>URI</p>
        <CopyInput
            value={`${getApiEndpoint(page.params.region)}/account/sessions/oauth2/callback/${provider.key}/${projectId}`} />
    </div>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button
            disabled={(secret === provider.secret &&
                enabled === provider.enabled &&
                appId === provider.appId) ||
                !(appId && isValidSecret)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
