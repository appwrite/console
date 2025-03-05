<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form, FormList, InputEmail, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isCloud } from '$lib/system';
    import { page } from '$app/stores';
    import { OAuthProvider } from '@appwrite.io/console';
    import { redirectTo } from '$routes/store';
    import { user } from '$lib/stores/user';

    let mail: string, pass: string, disabled: boolean;

    export let data;

    async function login() {
        try {
            disabled = true;
            await sdk.forConsole.account.createEmailPasswordSession(mail, pass);
            await invalidate(Dependencies.ACCOUNT);
            if ($user) {
                trackEvent(Submit.AccountLogin, { mfa_used: 'none' });
                addNotification({
                    type: 'success',
                    message: 'Successfully logged in.'
                });
            }
            if ($redirectTo) {
                window.location.href = $redirectTo;
                return;
            }

            await invalidate(Dependencies.ACCOUNT);
            if (data?.couponData?.code) {
                trackEvent(Submit.AccountCreate, { campaign_name: data?.couponData?.code });
                await goto(`${base}/apply-credit?code=${data?.couponData?.code}`);
                return;
            }
            if (data?.campaign?.$id) {
                await goto(`${base}/apply-credit?campaign=${data.campaign?.$id}`);
                return;
            }
        } catch (error) {
            disabled = false;
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountLogin);
        }
    }

    function onGithubLogin() {
        let url = window.location.origin;

        if ($page.url.searchParams) {
            const redirect = $page.url.searchParams.get('redirect');
            $page.url.searchParams.delete('redirect');
            if (redirect) {
                url = `${redirect}${$page.url.search}`;
            } else {
                url = `${base}${$page.url.search ?? ''}`;
            }
        }
        sdk.forConsole.account.createOAuth2Session(
            OAuthProvider.Github,
            window.location.origin + url,
            window.location.origin,
            ['read:user', 'user:email']
        );
    }
</script>

<svelte:head>
    <title>Sign in - Appwrite</title>
</svelte:head>

<Unauthenticated coupon={data?.couponData} campaign={data?.campaign}>
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
                    bind:value={pass} />
                <Button fullWidth submit {disabled}>Sign in</Button>
                {#if isCloud}
                    <span class="with-separators eyebrow-heading-3">or</span>
                    <Button secondary fullWidth on:click={onGithubLogin} {disabled}>
                        <span class="icon-github" aria-hidden="true" />
                        <span class="text">Sign in with GitHub</span>
                    </Button>
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
