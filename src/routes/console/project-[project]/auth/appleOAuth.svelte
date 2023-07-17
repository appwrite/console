<script lang="ts">
    import { page } from '$app/stores';
    import { Alert, CopyInput, Modal } from '$lib/components';
    import { Button, FormList, InputSwitch, InputText, InputTextarea } from '$lib/elements/forms';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { updateOAuth } from './updateOAuth';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;

    export let provider: Provider;

    let appId: string = null;
    let enabled: boolean = null;
    let keyID: string = null;
    let teamID: string = null;
    let p8: string = null;
    let error: string;

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;
        if (provider.secret) ({ keyID, teamID, p8 } = JSON.parse(provider.secret));
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

<Modal {error} onSubmit={update} size="big" show on:close>
    <svelte:fragment slot="header"
        >{provider.name}{' '}{$LL.console.project.title.oAuth2()}</svelte:fragment>
    <FormList>
        <p>
            {$LL.console.project.texts.oAuthProvider.textOne()}{' '}{provider.name}{' '}{$LL.console.project.texts.oAuthProvider.phraseOne()}
            <a class="link" href={provider.docs} target="_blank" rel="noopener noreferrer">
                {$LL.console.project.links.oAuthProvider.visitDoc()}
            </a>
        </p>
        <InputSwitch
            id="state"
            bind:value={enabled}
            label={enabled
                ? $LL.console.forms.inputSwitch.enable()
                : $LL.console.forms.inputSwitch.disabled()} />
        <InputText
            id="bundleID"
            label={$LL.console.project.forms.inputs.appleAuth.bundleID.label()}
            autofocus={true}
            placeholder={$LL.console.project.forms.inputs.appleAuth.bundleID.placeholder()}
            bind:value={appId} />
        <InputText
            id="keyID"
            label={$LL.console.project.forms.inputs.appleAuth.keyID.label()}
            placeholder={$LL.console.project.forms.inputs.appleAuth.keyID.placeholder()}
            bind:value={keyID} />
        <InputText
            id="teamID"
            label={$LL.console.project.forms.inputs.appleAuth.teamID.label()}
            placeholder={$LL.console.project.forms.inputs.appleAuth.teamID.placeholder()}
            bind:value={teamID} />
        <InputTextarea
            id="p8"
            label={$LL.console.project.forms.inputs.appleAuth.p8.label()}
            placeholder=""
            bind:value={p8} />
        <Alert type="info">
            {$LL.console.project.alert.oAuthProvider.fieldOne()}{' '}{provider.name}{' '}
            {$LL.console.project.alert.oAuthProvider.fieldTwo()}
        </Alert>
        <div>
            <p>{$LL.console.project.texts.oAuthProvider.uri()}</p>
            <CopyInput
                value={`${
                    sdk.forConsole.client.config.endpoint
                }/account/sessions/oauth2/callback/${provider.name.toLocaleLowerCase()}/${projectId}`} />
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button
            disabled={(secret === provider.secret &&
                enabled === provider.enabled &&
                appId === provider.appId) ||
                !(appId && keyID && teamID && p8)}
            submit>{$LL.console.project.button.submit.update()}</Button>
    </svelte:fragment>
</Modal>
