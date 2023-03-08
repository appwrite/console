<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, CopyInput, Alert } from '$lib/components';
    import { Button, InputPassword, InputText, InputSwitch, FormList } from '$lib/elements/forms';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { addNotification } from '$lib/stores/notifications';
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let provider: Provider;

    let appId: string = null;
    let enabled: boolean = null;
    let clientSecret: string = null;
    let tenantID: string = null;
    let error: string;

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;
        if (provider.secret) ({ clientSecret, tenantID } = JSON.parse(provider.secret));
    });

    const projectId = $page.params.project;

    const update = async () => {
        try {
            await sdkForConsole.projects.updateOAuth2(
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

    $: secret =
        clientSecret && tenantID ? JSON.stringify({ clientSecret, tenantID }) : provider.secret;
</script>

<Modal {error} on:submit={update} size="big" show on:close>
    <svelte:fragment slot="header">{provider.name} OAuth2 Settings</svelte:fragment>
    <FormList>
        <p>
            To use {provider.name} authentication in your application, first fill in this form. For more
            info you can
            <a class="link" href={provider.docs} target="_blank" rel="noopener noreferrer">
                visit the docs.
            </a>
        </p>
        <InputSwitch id="state" bind:value={enabled} label={enabled ? 'Enabled' : 'Disabled'} />
        <InputText
            id="appID"
            label="Application (client) ID"
            autofocus={true}
            placeholder="Enter ID"
            bind:value={appId} />
        <InputPassword
            id="secret"
            label="Client Secret"
            placeholder="Enter Client Secret"
            showPasswordButton
            minlength={0}
            bind:value={clientSecret} />
        <InputText
            id="tenant"
            label="Target Tenant"
            placeholder="'common','organizations','consumers' or your TenantID"
            bind:value={tenantID} />
        <Alert type="info">
            To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
        </Alert>
        <div>
            <p>URI</p>
            <CopyInput
                value={`${
                    sdkForConsole.client.config.endpoint
                }/account/sessions/oauth2/callback/${provider.name.toLocaleLowerCase()}/${projectId}`} />
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button
            disabled={(secret === provider.secret &&
                enabled === provider.enabled &&
                appId === provider.appId) ||
                !(appId && clientSecret && tenantID)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
