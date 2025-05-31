<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import {
        Button,
        Form,
        InputChoice,
        InputEmail,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { ID, OAuthProvider } from '@appwrite.io/console';
    import { isCloud } from '$lib/system';
    import { page } from '$app/state';
    import { redirectTo } from '$routes/store';
    import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';
    import { Layout, Link, Typography } from '@appwrite.io/pink-svelte';

    export let data;

    let name: string, mail: string, pass: string, disabled: boolean;
    let terms = false;

    async function register() {
        try {
            disabled = true;
            await sdk.forConsole.account.create(ID.unique(), mail, pass, name ?? '');
            await sdk.forConsole.account.createEmailPasswordSession(mail, pass);

            trackEvent(Submit.AccountCreate, { campaign_name: data?.couponData?.code });

            if (data?.couponData?.code) {
                await goto(`${base}/apply-credit?code=${data?.couponData?.code}`);
                return;
            } else if (data?.campaign?.$id) {
                await goto(`${base}/apply-credit?campaign=${data.campaign.$id}`);
                return;
            } else if ($redirectTo) {
                window.location.href = $redirectTo;
                return;
            } else if (page.url.searchParams) {
                const redirect = page.url.searchParams.get('redirect');
                page.url.searchParams.delete('redirect');
                if (redirect) {
                    await goto(`${redirect}${page.url.search}`);
                } else if (isCloud) {
                    checkPricingRefAndRedirect(page.url.searchParams);
                } else {
                    await goto(`${base}/${page.url.search ?? ''}`);
                }
            } else {
                await goto(base);
            }

            await invalidate(Dependencies.ACCOUNT);
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
        sdk.forConsole.account.createOAuth2Session(
            OAuthProvider.Github,
            window.location.origin,
            window.location.origin,
            ['read:user', 'user:email']
        );
    }
</script>

<svelte:head>
    <title>Sign up - Appwrite</title>
</svelte:head>

<Unauthenticated coupon={data?.couponData} campaign={data?.campaign}>
    <svelte:fragment slot="title">Sign up</svelte:fragment>
    <svelte:fragment>
        <Form onSubmit={register}>
            <Layout.Stack>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Your name"
                    autofocus
                    required
                    bind:value={name} />
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder="Your email"
                    required
                    bind:value={mail} />
                <InputPassword
                    id="password"
                    label="Password"
                    placeholder="Your password"
                    helper="Password must be at least 8 characters long"
                    required
                    bind:value={pass} />
                <InputChoice required value={terms} id="terms" label="terms" showLabel={false}>
                    By registering, you agree that you have read, understand, and acknowledge our <Link.Anchor
                        href="https://appwrite.io/privacy"
                        target="_blank"
                        rel="noopener noreferrer">
                        Privacy Policy</Link.Anchor>
                    and accept our
                    <Link.Anchor
                        href="https://appwrite.io/terms"
                        target="_blank"
                        rel="noopener noreferrer">General Terms of Use</Link.Anchor
                    >.</InputChoice>
                <Button fullWidth submit {disabled}>Sign up</Button>
                {#if isCloud}
                    <span class="with-separators eyebrow-heading-3">or</span>
                    <Button secondary fullWidth on:click={onGithubLogin} {disabled}>
                        <span class="icon-github" aria-hidden="true"></span>
                        <span class="text">Sign up with GitHub</span>
                    </Button>
                {/if}
            </Layout.Stack>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <Typography.Text variant="m-400">
            Already got an account? <Link.Anchor href={`${base}/login${page?.url?.search ?? ''}`}
                >Sign in</Link.Anchor>
        </Typography.Text>
    </svelte:fragment>
</Unauthenticated>
