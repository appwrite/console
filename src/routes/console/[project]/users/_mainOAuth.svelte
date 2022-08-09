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
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Provider } from '$lib/stores/oauth-providers';

    export let showModal = false;
    export let provider: Provider;
    const projectId = $page.params.project;
    let modalError: string;

    const update = async () => {
        try {
            await sdkForConsole.projects.updateOAuth2(
                projectId,
                provider.name.toLowerCase(),
                provider.id,
                provider.secret
            );
            showModal = false;
        } catch (error) {
            modalError = error.message;
        }
    };
</script>

<Form on:submit={update}>
    <Modal error={modalError} size="big" bind:show={showModal}>
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
                label="App ID"
                autofocus={true}
                autocomplete={false}
                placeholder="Enter ID"
                bind:value={provider.id} />
            <InputPassword
                id="secret"
                label="App Secret"
                placeholder="Enter App Secret"
                meter={false}
                bind:value={provider.secret} />
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
