<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, Copy, InfoSection } from '$lib/components';
    import { Button, InputPassword, InputText, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';

    export let showModal = false;
    export let provider: string;
    let appId: string, secret: string;
    const projectId = $page.params.project;
    let redirectURI = `${
        sdkForConsole.config.endpoint
    }/account/session/oauth2/callback/${provider.toLocaleLowerCase()}/${projectId}`;

    const update = async () => {
        try {
            const oauth = await sdkForConsole.projects.updateOAuth2(
                projectId,
                provider,
                appId,
                secret
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
        <svelte:fragment slot="header">{provider} OAuth2 Settings</svelte:fragment>
        <InputText
            id="appId"
            label="App Id"
            autofocus={true}
            autocomplete={false}
            bind:value={appId} />
        <InputPassword id="secret" label="App Secret" meter={false} bind:value={secret} />
        <InfoSection>
            <p>
                To complete set up, add this OAuth2 redirect URI to your {provider} app configuration.
            </p>
            <Copy bind:value={redirectURI} />
        </InfoSection>
        <svelte:fragment slot="footer">
            <Button submit>Update</Button>
            <Button secondary on:click={() => (showModal = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
