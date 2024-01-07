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
    import { isCloud } from '$lib/system';
    import { page } from '$app/stores';

    let mail: string, pass: string, disabled: boolean;

    async function login() {
        try {
            disabled = true;
            await sdk.forConsole.account.createEmailSession(mail, pass);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            trackEvent(Submit.AccountCreate);
            if ($page.url.searchParams) {
                const redirect = $page.url.searchParams.get('redirect');
                $page.url.searchParams.delete('redirect');
                if (redirect) {
                    await goto(`${base}${redirect}${$page.url.search}`);
                } else {
                    await goto(`${base}/console${$page.url.search ?? ''}`);
                }
            } else {
                await goto(`${base}/console`);
            }
        } catch (error) {
            disabled = false;
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountCreate);
        }
    }

    function onGithubLogin() {
        let url = window.location.origin;
        if ($page.url.searchParams) {
            const redirect = $page.url.searchParams.get('redirect');
            $page.url.searchParams.delete('redirect');
            if (redirect) {
                url = `${base}${redirect}${$page.url.search}`;
            } else {
                url = `${base}/console${$page.url.search ?? ''}`;
            }
        }
        sdk.forConsole.account.createOAuth2Session(
            'github',
            window.location.origin + url,
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
        <Form onSubmit={login}>
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
                {#if isCloud}
                    <span class="with-separators eyebrow-heading-3">or</span>
                    <FormItem>
                        <Button github fullWidth on:click={onGithubLogin} {disabled}>
                            <span class="icon-github" aria-hidden="true" />
                            <span class="text">Sign in with GitHub</span>
                        </Button>
                    </FormItem>
                {/if}
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/recover`}><span class="text">Forgot Password?</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register${$page?.url?.search ?? ''}`}>
                <span class="text">Sign Up</span>
            </a>
        </li>
    </svelte:fragment>
</Unauthenticated>
