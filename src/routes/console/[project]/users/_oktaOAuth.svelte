<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, CopyInput, Alert } from '$lib/components';
    import {
        Button,
        InputPassword,
        InputText,
        InputSwitch,
        Form,
        FormList
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Provider } from '$lib/stores/oauth-providers';

    export let showModal = false;
    export let provider: Provider;

    let { clientSecret, oktaDomain, authorizationServerId } = JSON.parse(provider.secret);

    const projectId = $page.params.project;
    const update = async () => {
        try {
            const secret = JSON.stringify({ clientSecret, oktaDomain, authorizationServerId });
            await sdkForConsole.projects.updateOAuth2(
                projectId,
                provider.name.toLowerCase(),
                provider.id,
                secret
            );

            showModal = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={update}>
    <Modal size="big" bind:show={showModal}>
        <svelte:fragment slot="header">{provider.name} OAuth2 Settings</svelte:fragment>
        <FormList>
            <p>
                To use {provider.name} authentication in your application, first fill in this form. For
                more info you can
                <a class="link" href={provider.docs} target="_blank" rel="noopener noreferrer"
                    >visit the docs.</a>
            </p>
            <InputSwitch
                id="state"
                bind:value={provider.active}
                label={provider.active ? 'Enabled' : 'Disabled'} />
            <InputText
                id="appID"
                label="Client ID"
                autofocus={true}
                autocomplete={false}
                placeholder="Enter ID"
                bind:value={provider.id} />
            <InputPassword
                id="secret"
                label="Client Secret"
                placeholder="Enter Client Secret"
                meter={false}
                bind:value={clientSecret} />
            <InputText
                id="domain"
                label="Okta Domain"
                autocomplete={false}
                placeholder="dev-1337.okta.com"
                bind:value={oktaDomain} />
            <InputText
                id="serverID"
                label="Authorization Server ID"
                autocomplete={false}
                placeholder="default"
                bind:value={authorizationServerId} />

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
            <Button submit>Update</Button>
        </svelte:fragment>
    </Modal>
</Form>
