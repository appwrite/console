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
    import { LanguageSelector } from '$lib/components';
    import LL from '../../i18n/i18n-svelte';

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
<<<<<<< HEAD
    <title>{$LL.login.title()} - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">{$LL.login.title()}</svelte:fragment>
=======
    <title>Sign in - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Sign in</svelte:fragment>
>>>>>>> 78eda2358c398774c986fd7a63b63ad4b9688911
    <svelte:fragment>
        <Form onSubmit={login}>
            <FormList>
                <InputEmail
                    id="email"
<<<<<<< HEAD
                    label={$LL.login.field_inputs.email()}
                    placeholder={$LL.globals.placeholders.email()}
=======
                    label="Email"
                    placeholder="Email"
>>>>>>> 78eda2358c398774c986fd7a63b63ad4b9688911
                    autofocus={true}
                    required={true}
                    bind:value={mail} />
                <InputPassword
                    id="password"
<<<<<<< HEAD
                    label={$LL.login.field_inputs.password()}
                    placeholder={$LL.globals.placeholders.password()}
=======
                    label="Password"
                    placeholder="Password"
>>>>>>> 78eda2358c398774c986fd7a63b63ad4b9688911
                    required={true}
                    meter={false}
                    showPasswordButton={true}
                    bind:value={pass} />
                <FormItem>
<<<<<<< HEAD
                    <Button fullWidth submit>{$LL.login.title()}</Button>
=======
                    <Button fullWidth submit>Sign in</Button>
>>>>>>> 78eda2358c398774c986fd7a63b63ad4b9688911
                </FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
<<<<<<< HEAD
            <a href={`${base}/recover`}
                ><span class="text">{$LL.password_recovery.forgot_password()}?</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}><span class="text">{$LL.sign_up.title()}</span></a>
        </li>
        <li class="inline-links-item">
            <LanguageSelector />
=======
            <a href={`${base}/recover`}><span class="text">Forgot Password?</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}><span class="text">Sign Up</span></a>
>>>>>>> 78eda2358c398774c986fd7a63b63ad4b9688911
        </li>
    </svelte:fragment>
</Unauthenticated>
