<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import {
        Button,
        Form,
        FormItem,
        FormList,
        InputEmail,
        InputPassword
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { LanguageSelector } from '$lib/components';
    import LL from '$lib/i18n/i18n-svelte';

    let mail: string, pass: string;

    async function login() {
        try {
            await sdk.forConsole.account.createEmailSession(mail, pass);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            trackEvent(Submit.AccountCreate);
            await goto(`${base}/console`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountCreate);
        }
    }
</script>

<svelte:head>
    <title>{$LL.login.title()} - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">{$LL.login.title()}</svelte:fragment>
    <svelte:fragment>
        <Form onSubmit={login}>
            <FormList>
                <InputEmail
                    id="email"
                    label={$LL.login.field_inputs.email()}
                    placeholder={$LL.globals.placeholders.email()}
                    autofocus={true}
                    required={true}
                    bind:value={mail} />
                <InputPassword
                    id="password"
                    label={$LL.login.field_inputs.password()}
                    placeholder={$LL.globals.placeholders.password()}
                    required={true}
                    meter={false}
                    showPasswordButton={true}
                    bind:value={pass} />
                <FormItem>
                    <Button fullWidth submit>{$LL.login.title()}</Button>
                </FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/recover`}
                ><span class="text">{$LL.password_recovery.forgot_password()}?</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}><span class="text">{$LL.sign_up.title()}</span></a>
        </li>
        <li class="inline-links-item">
            <LanguageSelector />
        </li>
    </svelte:fragment>
</Unauthenticated>
