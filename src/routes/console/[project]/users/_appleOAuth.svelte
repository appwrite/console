<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, Copy, Alert } from '$lib/components';
    import { Button, InputText, InputTextarea, InputSwitch, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';

    export let showModal = false;
    export let provider;

    let { keyID, teamID, p8 } = JSON.parse(provider.secret);

    const projectId = $page.params.project;
    const update = async () => {
        try {
            const secret = JSON.stringify({ keyID, teamID, p8 });
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
    <Modal bind:show={showModal}>
        <svelte:fragment slot="header">{provider.name} OAuth2 Settings</svelte:fragment>
        <p>
            To use {provider.name} authentication in your application, first fill in this form. For more
            info you can
            <a class="link" href={provider.docs} target="_blank" rel="noopener noreferrer"
                >visit the docs.</a>
        </p>
        <InputSwitch
            id="state"
            bind:value={provider.active}
            label={provider.active ? 'Enabled' : 'Disabled'} />
        <InputText
            id="bundleID"
            label="Bundle ID"
            autofocus={true}
            autocomplete={false}
            placeholder="com.company.appname"
            bind:value={provider.id} />
        <InputText
            id="keyID"
            label="key ID"
            autocomplete={false}
            placeholder="SHAB13ROFN"
            bind:value={keyID} />
        <InputText
            id="teamID"
            label="team ID"
            autocomplete={false}
            placeholder="ELA2CD3AED"
            bind:value={teamID} />
        <InputTextarea id="p8" label="P8 File" placeholder="" bind:value={p8} />
        <Alert type="info">
            <p>
                To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
            </p>
        </Alert>
        <p>URI</p>
        <Copy
            value={`${
                sdkForConsole.config.endpoint
            }/account/session/oauth2/callback/${provider.name.toLocaleLowerCase()}/${projectId}`} />
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showModal = false)}>Cancel</Button>
            <Button submit>Update</Button>
        </svelte:fragment>
    </Modal>
</Form>
