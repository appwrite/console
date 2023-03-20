<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, CopyInput, Alert } from '$lib/components';
    import { Button, InputPassword, InputText, InputSwitch, FormList } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { addNotification } from '$lib/stores/notifications';
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let provider: Provider;

    const projectId = $page.params.project;

    let enabled: boolean = null;
    let appId: string = null;
    let secret: string = null;

    onMount(() => {
        enabled ??= provider.enabled;
        appId ??= provider.appId;
        secret ??= provider.secret;
    });

    let error: string;

    const update = async () => {
        try {
            await sdk.forConsole.projects.updateOAuth2(
                projectId,
                provider.name.toLowerCase(),
                appId,
                secret,
                enabled
            );
            addNotification({
                type: 'success',
                message: `${provider.name} authentication has been ${
                    provider.enabled ? 'enabled' : 'disabled'
                }`
            });
            trackEvent(Submit.ProviderUpdate, {
                provider,
                enabled
            });
            provider = null;
            invalidate(Dependencies.PROJECT);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProviderUpdate);
        }
    };
</script>

<Modal {error} size="big" show onSubmit={update} on:close>
    <svelte:fragment slot="header">{provider.name} OAuth2 Settings</svelte:fragment>
    <FormList>
        <p>
            To use {provider.name} authentication in your application, first fill in this form. For more
            info you can
            <a class="link" href={provider.docs} target="_blank" rel="noopener noreferrer"
                >visit the docs.</a>
        </p>
        <InputSwitch id="state" bind:value={enabled} label={enabled ? 'Enabled' : 'Disabled'} />
        <InputText
            id="appID"
            label="App ID"
            autofocus={true}
            placeholder="Enter ID"
            bind:value={appId} />
        <InputPassword
            id="secret"
            label="App Secret"
            placeholder="Enter App Secret"
            minlength={0}
            showPasswordButton
            bind:value={secret} />
        <Alert type="info">
            To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
        </Alert>
        <div>
            <p>URI</p>
            <CopyInput
                value={`${
                    sdk.forConsole.client.config.endpoint
                }/account/sessions/oauth2/callback/${provider.name.toLocaleLowerCase()}/${projectId}`} />
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button
            disabled={!appId ||
                !secret ||
                (appId === provider.appId &&
                    secret === provider.secret &&
                    enabled === provider.enabled)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
