<script lang="ts">
    import { page } from '$app/stores';
    import { Alert, CopyInput, Modal } from '$lib/components';
    import { Button, FormList, InputPassword, InputSwitch, InputText } from '$lib/elements/forms';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { updateOAuth } from './updateOAuth';
    import LL from '$i18n/i18n-svelte';

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
        const result = await updateOAuth({ projectId, provider, secret, appId, enabled });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };

    $: secret =
        clientSecret && tenantID ? JSON.stringify({ clientSecret, tenantID }) : provider.secret;
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
            id="appID"
            label={$LL.console.project.forms.oAuthProvider.inputs.microsoftAuth.appId.label()}
            autofocus={true}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.microsoftAuth.appId.placeholder()}
            bind:value={appId} />
        <InputPassword
            id="secret"
            label={$LL.console.project.forms.oAuthProvider.inputs.microsoftAuth.secret.label()}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.microsoftAuth.secret.placeholder()}
            showPasswordButton
            minlength={0}
            bind:value={clientSecret} />
        <InputText
            id="tenant"
            label={$LL.console.project.forms.oAuthProvider.inputs.microsoftAuth.tenant.label()}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.microsoftAuth.tenant.placeholder()}
            bind:value={tenantID} />
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
                !(appId && clientSecret && tenantID)}
            submit>{$LL.console.project.button.submit.update()}</Button>
    </svelte:fragment>
</Modal>
