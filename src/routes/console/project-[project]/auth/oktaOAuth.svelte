<script lang="ts">
    import { page } from '$app/stores';
    import { Alert, CopyInput, Modal } from '$lib/components';
    import { Button, FormList, InputPassword, InputSwitch, InputText } from '$lib/elements/forms';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { updateOAuth } from './updateOAuth';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;

    export let provider: Provider;

    let appId: string = null;
    let enabled: boolean = null;
    let clientSecret: string = null;
    let oktaDomain: string = null;
    let authorizationServerId: string = null;
    let error: string;

    onMount(() => {
        appId ??= provider.appId;
        enabled ??= provider.enabled;
        if (provider.secret) {
            ({ clientSecret, oktaDomain, authorizationServerId } = JSON.parse(provider.secret));
        }
    });

    const update = async () => {
        const result = await updateOAuth({ projectId, provider, secret, appId, enabled });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };

    $: secret =
        clientSecret && oktaDomain && authorizationServerId
            ? JSON.stringify({ clientSecret, oktaDomain, authorizationServerId })
            : provider.secret;
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
            label={$LL.console.project.forms.oAuthProvider.inputs.oktaAuth.appId.label()}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.oktaAuth.appId.placeholder()}
            autofocus={true}
            bind:value={appId} />
        <InputPassword
            id="secret"
            label={$LL.console.project.forms.oAuthProvider.inputs.oktaAuth.secret.label()}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.oktaAuth.secret.placeholder()}
            minlength={0}
            showPasswordButton
            bind:value={clientSecret} />
        <InputText
            id="domain"
            label={$LL.console.project.forms.oAuthProvider.inputs.oktaAuth.domain.label()}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.oktaAuth.domain.placeholder()}
            bind:value={oktaDomain} />
        <InputText
            id="serverID"
            label={$LL.console.project.forms.oAuthProvider.inputs.oktaAuth.serverId.label()}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.oktaAuth.serverId.placeholder()}
            bind:value={authorizationServerId} />

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
                !(appId && clientSecret && oktaDomain && authorizationServerId)}
            submit>{$LL.console.project.button.submit.update()}</Button>
    </svelte:fragment>
</Modal>
