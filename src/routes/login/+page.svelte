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
    import { _ } from '$lib/i18n';

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
    <title>{$_.t('login.title')} - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">{$_.t('login.title')}</svelte:fragment>
    <svelte:fragment>
        <Form onSubmit={login}>
            <FormList>
                <InputEmail
                    id="email"
                    label={$_.t('login.field_inputs.email')}
                    placeholder={$_.t('globals.placeholders.email')}
                    autofocus={true}
                    required={true}
                    bind:value={mail} />
                <InputPassword
                    id="password"
                    label={$_.t('login.field_inputs.password')}
                    placeholder={$_.t('globals.placeholders.password')}
                    required={true}
                    meter={false}
                    showPasswordButton={true}
                    bind:value={pass} />
                <FormItem>
                    <Button fullWidth submit>{$_.t('login.title')}</Button>
                </FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/recover`}
                ><span class="text">{$_.t('password_recovery.forgot_password')}?</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}><span class="text">{$_.t('sign_up.title')}</span></a>
        </li>
    </svelte:fragment>
</Unauthenticated>
