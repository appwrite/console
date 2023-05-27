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
    import { sdkForConsole } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';

    let mail: string, pass: string, disabled: boolean;

    async function login() {
        try {
            disabled = true;
            await sdkForConsole.account.createEmailSession(mail, pass);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            trackEvent('submit_session_create');
            await goto(`${base}/console`);
        } catch (error) {
            disabled = false;
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    function onGithubLogin() {
        sdkForConsole.account.createOAuth2Session(
            'github',
            window.location.origin,
            window.location.origin,
            ['read:user', 'user:email']
        );
    }
</script>

<svelte:head>
    <title>Sign in - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Sign in</svelte:fragment>
    <svelte:fragment>
        <Form on:submit={login}>
            <FormList>
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder="Email"
                    autofocus={true}
                    required={true}
                    bind:value={mail} />
                <InputPassword
                    id="password"
                    label="Password"
                    placeholder="Password"
                    required={true}
                    meter={false}
                    showPasswordButton={true}
                    bind:value={pass} />
                <FormItem>
                    <Button fullWidth submit {disabled}>Sign in</Button>
                </FormItem>
                <span class="with-separators eyebrow-heading-3">or</span>
                <FormItem>
                    <Button github fullWidth on:click={onGithubLogin} {disabled}>
                        <span class="icon-github" aria-hidden="true" />
                        <span class="text">Sign in with GitHub</span>
                    </Button>
                </FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/recover`}><span class="text">Forgot Password?</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}><span class="text">Sign Up</span></a>
        </li>
    </svelte:fragment>
</Unauthenticated>
