<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, CopyInput, Alert } from '$lib/components';
    import { Button, InputText, InputTextarea, InputSwitch, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let provider: Provider;

    let appId: string = null;
    let enabled: boolean = null;
    let keyID: string = null;
    let teamID: string = null;
    let p8: string = null;

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;
        if (provider.secret) ({ keyID, teamID, p8 } = JSON.parse(provider.secret));
    });

    let error: string;

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

    $: secret = keyID && teamID && p8 ? JSON.stringify({ keyID, teamID, p8 }) : provider.secret;
</script>

<Modal {error} onSubmit={update} size="big" show on:close>
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
            id="bundleID"
            label="Bundle ID"
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
                !(appId && keyID && teamID && p8)}
            submit>Update</Button>
    </svelte:fragment>
</Modal>
