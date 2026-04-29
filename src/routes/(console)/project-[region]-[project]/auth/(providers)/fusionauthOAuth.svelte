<script lang="ts">
    import { page } from '$app/state';
    import { CopyInput, Modal } from '$lib/components';
    import { Button, InputPassword, InputSwitch, InputText } from '$lib/elements/forms';
    import { oAuthProviders, type Provider } from '$lib/stores/oauth-providers';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Alert, Link } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import { updateOAuth } from '../updateOAuth';

    const projectId = page.params.project;
    const region = page.params.region;

    export let provider: Models.AuthProvider;
    export let show = false;

    let appId: string = null;
    let enabled: boolean = null;
    let clientSecret: string = null;
    let endpoint: string = null;
    let error: string;
    let oAuthProvider: Provider;

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;

        if (provider.secret) {
            ({ clientSecret, endpoint } = JSON.parse(provider.secret));
        }

        oAuthProvider = oAuthProviders[provider.key];
    });

    const update = async () => {
        const result = await updateOAuth({ region, projectId, provider, secret, appId, enabled });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };

    $: secret = clientSecret && endpoint ? JSON.stringify({ clientSecret, endpoint }) : provider.secret;
</script>

<Modal {error} bind:show onSubmit={update} on:close title={`${provider.name} OAuth2 settings`}>
    <p slot="description">
        To use {provider.name} authentication in your application, first fill in this form. For more info
        you can
        <Link.Anchor
            class="link"
            href={oAuthProvider?.docs}
            target="_blank"
            rel="noopener noreferrer">visit the docs.</Link.Anchor>
    </p>
    <InputSwitch id="state" bind:value={enabled} label={enabled ? 'Enabled' : 'Disabled'} />
    <InputText
        id="client-id"
        label="Client ID"
        autofocus={true}
        placeholder="Enter Client ID"
        bind:value={appId}
        required />
    <InputPassword
        id="client-secret"
        label="Client Secret"
        placeholder="Enter Client Secret"
        minlength={0}
        bind:value={clientSecret}
        required />
    <InputText
        id="endpoint"
        label="FusionAuth Domain"
        placeholder="example.fusionauth.io"
        bind:value={endpoint}
        required />
    <Alert.Inline status="info">
        To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
    </Alert.Inline>
    <CopyInput
        label="URI"
        value={`${getApiEndpoint(page.params.region)}/account/sessions/oauth2/callback/${provider.key}/${projectId}`} />
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button
            disabled={!appId ||
                !clientSecret ||
                !endpoint ||
                (secret === provider.secret &&
                    enabled === provider.enabled &&
                    appId === provider.appId)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
