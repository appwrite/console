<script lang="ts">
    import { page } from '$app/state';
    import { CopyInput, Modal } from '$lib/components';
    import { Button, InputPassword, InputSwitch, InputText } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { updateOAuth } from '../updateOAuth';
    import type { Models } from '@appwrite.io/console';
    import { oAuthProviders, type Provider } from '$lib/stores/oauth-providers';
    import { Link, Alert } from '@appwrite.io/pink-svelte';
    import { getApiEndpoint } from '$lib/stores/sdk';

    const projectId = page.params.project;

    export let provider: Models.AuthProvider;
    export let show = false;

    let enabled: boolean = null;
    let appId: string = null;
    let secret: string = null;
    let oAuthProvider: Provider;

    onMount(() => {
        enabled ??= provider.enabled;
        appId ??= provider.appId;
        secret ??= provider.secret;
        oAuthProvider = oAuthProviders[provider.key];
    });

    let error: string;

    const update = async () => {
        const result = await updateOAuth({ projectId, provider, secret, appId, enabled });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };
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
        id="appID"
        label="App ID"
        autofocus={true}
        placeholder="Enter ID"
        bind:value={appId}
        required />
    <InputPassword
        id="secret"
        label="App Secret"
        placeholder="Enter App Secret"
        minlength={0}
        bind:value={secret}
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
                !secret ||
                (secret === provider.secret &&
                    enabled === provider.enabled &&
                    appId === provider.appId)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
