<script lang="ts">
    import { page } from '$app/stores';
    import { Alert, CopyInput, Modal } from '$lib/components';
    import { Button, FormList, InputSwitch, InputText, InputTextarea } from '$lib/elements/forms';
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
    let keyID: string = null;
    let teamID: string = null;
    let p8: string = null;
    let error: string;
    let oAuthProvider: Provider;

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;
        if (provider.secret) ({ keyID, teamID, p8 } = JSON.parse(provider.secret));
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

    $: secret = keyID && teamID && p8 ? JSON.stringify({ keyID, teamID, p8 }) : provider.secret;
</script>

<Modal {error} onSubmit={update} size="big" bind:show on:close>
    <svelte:fragment slot="title">{provider.name} OAuth2 Settings</svelte:fragment>
    <FormList>
        <p>
            To use {provider.name} authentication in your application, first fill in this form. For more
            info you can
            <a class="link" href={oAuthProvider?.docs} target="_blank" rel="noopener noreferrer">
                visit the docs.
            </a>
        </p>
        <InputSwitch id="state" bind:value={enabled} label={enabled ? 'Enabled' : 'Disabled'} />
        <InputText
            id="servicesID"
            label="Services ID"
            autofocus={true}
            placeholder="com.company.appname"
            bind:value={appId} />
        <InputText id="keyID" label="Key ID" placeholder="SHAB13ROFN" bind:value={keyID} />
        <InputText id="teamID" label="Team ID" placeholder="ELA2CD3AED" bind:value={teamID} />
        <InputTextarea id="p8" label="P8 File" placeholder="" bind:value={p8} />
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
                !(appId && keyID && teamID && p8)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
