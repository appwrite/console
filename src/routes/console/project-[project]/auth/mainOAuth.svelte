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

    const projectId = $page.params.project;

    let enabled: boolean = null;
    let appId: string = null;
    let secret: string = null;

    onMount(() => {
        enabled ??= provider.enabled;
        appId ??= provider.appId;
        secret ??= provider.secret;
    });

    let error: string;

    const update = async () => {
        const result = await updateOAuth({ projectId, provider, secret, appId, enabled });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };
</script>

<Modal {error} size="big" show onSubmit={update} on:close>
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
            label={$LL.console.project.forms.oAuthProvider.inputs.mainAuth.appId.label()}
            autofocus={true}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.mainAuth.appId.placeholder()}
            bind:value={appId} />
        <InputPassword
            id="secret"
            label={$LL.console.project.forms.oAuthProvider.inputs.mainAuth.secret.label()}
            placeholder={$LL.console.project.forms.oAuthProvider.inputs.mainAuth.secret.placeholder()}
            minlength={0}
            showPasswordButton
            bind:value={secret} />
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
            disabled={!appId ||
                !secret ||
                (appId === provider.appId &&
                    secret === provider.secret &&
                    enabled === provider.enabled)}
            submit>{$LL.console.project.button.submit.update()}</Button>
    </svelte:fragment>
</Modal>
