<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, CopyInput, Alert } from '$lib/components';
    import { Button, InputPassword, InputText, InputSwitch, FormList } from '$lib/elements/forms';
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { addNotification } from '$lib/stores/notifications';
    import { onMount } from 'svelte';

    export let showModal = false;
    export let provider: Provider;

    let id: string = null;
    let active = false;
    let clientSecret: string = null;
    let tenantID: string = null;
    let error: string;

    onMount(() => {
        id ??= provider.id;
        active ??= provider.active;
        if (provider.secret) ({ clientSecret, tenantID } = JSON.parse(provider.secret));
    });

    const projectId = $page.params.project;

    const update = async () => {
        try {
            await sdkForConsole.projects.updateOAuth2(
                projectId,
                provider.name.toLowerCase(),
                id,
                secret
            );
            provider.active = active;
            provider.id = id;
            provider.secret = secret;

            showModal = false;
            addNotification({
                type: 'success',
                message: `${provider.name} authentication has been ${
                    provider.active ? 'enabled' : 'disabled'
                }`
            });
        } catch ({ message }) {
            error = message;
        }
    };

    $: secret =
        clientSecret && tenantID ? JSON.stringify({ clientSecret, tenantID }) : provider.secret;
</script>

<Modal {error} on:submit={update} size="big" bind:show={showModal}>
    <svelte:fragment slot="header">{provider.name} OAuth2 Settings</svelte:fragment>
    <FormList>
        <p>
            To use {provider.name} authentication in your application, first fill in this form. For more
            info you can
            <a class="link" href={provider.docs} target="_blank" rel="noopener noreferrer">
                visit the docs.
            </a>
        </p>
        <InputSwitch id="state" bind:value={active} label={active ? 'Enabled' : 'Disabled'} />
        <InputText
            id="appID"
            label="Application (client) ID"
            autofocus={true}
            placeholder="Enter ID"
            bind:value={id} />
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
                }/account/session/oauth2/callback/${provider.name.toLocaleLowerCase()}/${projectId}`} />
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showModal = false)}>Cancel</Button>
        <Button
            disabled={(secret === provider.secret &&
                active === provider.active &&
                id === provider.id) ||
                !(id && clientSecret && tenantID)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
