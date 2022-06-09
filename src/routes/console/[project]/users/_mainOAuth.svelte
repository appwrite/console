<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, Copy, InfoSection } from '$lib/components';
    import { Button, InputPassword, InputText, InputSwitch, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';

    export let showModal = false;
    export let provider;

    const projectId = $page.params.project;
    const update = async () => {
        try {
            const oauth = await sdkForConsole.projects.updateOAuth2(
                projectId,
                provider.name.toLowerCase(),
                provider.id,
                provider.secret
            );
            console.log(oauth);
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
    <Modal bind:show={showModal}>
        <svelte:fragment slot="header">{provider.name} OAuth2 Settings</svelte:fragment>
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
        <InfoSection>
            <p>
                To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
            </p>
            <Copy
                value={`${
                    sdkForConsole.config.endpoint
                }/account/session/oauth2/callback/${provider.name.toLocaleLowerCase()}/${projectId}`} />
        </InfoSection>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showModal = false)}>Cancel</Button>
            <Button submit>Update</Button>
        </svelte:fragment>
    </Modal>
</Form>
