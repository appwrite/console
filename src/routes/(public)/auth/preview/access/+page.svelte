<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import Modal from '$lib/components/modal.svelte';
    import { Dependencies } from '$lib/constants';
    import { Link } from '$lib/elements';
    import {
        Button,
        Form,
        InputChoice,
        InputEmail,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
    import { logout } from '$lib/helpers/logout';
    import { sdk } from '$lib/stores/sdk';
    import { isCloud } from '$lib/system';
    import { ID, OAuthProvider } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import BGDark from './bg_dark.jpg';
    import BGLight from './bg_light.jpg';
    import { app } from '$lib/stores/app.js';

    export let data;

    let state: 'register' | 'login' | 'authenticated' = 'login';
    let mail: string;
    let pass: string;
    let terms = false;
    let name: string;
    let error: string;

    let projectId: string;
    let origin: string;
    let path: string;

    onMount(() => {
        if (data?.account?.$id) {
            state = 'authenticated';
        }
        const params = new URLSearchParams(window.location.search);
        projectId = params.get('projectId');
        origin = params.get('origin');
        path = params.get('path');
    });

    async function login() {
        try {
            await sdk.forConsole.account.createEmailPasswordSession(mail, pass);
            await invalidate(Dependencies.ACCOUNT);
            trackEvent(Submit.AccountLogin);

            goto(`${base}/auth/preview?origin=${origin}&path=${path}&projectId=${projectId}`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AccountLogin);
        }
    }

    async function register() {
        try {
            await sdk.forConsole.account.create(ID.unique(), mail, pass, name ?? '');
            await sdk.forConsole.account.createEmailPasswordSession(mail, pass);

            await invalidate(Dependencies.ACCOUNT);
            trackEvent(Submit.AccountCreate);
            goto(`${base}/auth/preview?origin=${origin}&path=${path}&projectId=${projectId}`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AccountCreate);
        }
    }

    function onGithubAuth() {
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

    async function handleSubmit() {
        if (state === 'login') {
            await login();
        } else if (state === 'register') {
            await register();
        }
    }

    async function requestAccess() {
        //TODO: Implement request access
    }

    $: console.log(data);
</script>

{#if $app.themeInUse === 'dark'}
    <img class="preview-img" src={BGDark} alt="background" aria-hidden="true" />
{:else}
    <img class="preview-img" src={BGLight} alt="background" aria-hidden="true" />
{/if}

<svelte:head>
    <title>Preview access - Appwrite</title>
</svelte:head>

<Modal
    title={state === 'authenticated' ? 'Request access' : 'Sign up or log in to view this preview'}
    dismissible={false}
    show
    hideFooter={state !== 'authenticated'}
    {error}>
    <span slot="description">
        {#if state === 'authenticated'}
            Request access to view this preview. You'll gain access once your request is approved.
        {/if}
    </span>
    <Form onSubmit={handleSubmit}>
        <Layout.Stack gap="xxl">
            {#if state === 'login'}
                <Layout.Stack gap="l">
                    <InputEmail
                        id="email"
                        label="Email"
                        placeholder="Enter email"
                        autofocus
                        required
                        bind:value={mail} />
                    <InputPassword
                        id="password"
                        label="Password"
                        placeholder="Enter password"
                        required
                        bind:value={pass} />
                </Layout.Stack>

                <Layout.Stack gap="l">
                    <Button size="m" fullWidth submit>Sign in</Button>
                    <span class="with-separators eyebrow-heading-3">or</span>
                    {#if isCloud}
                        <Button size="m" secondary fullWidth on:click={onGithubAuth}>
                            <span class="icon-github" aria-hidden="true"></span>
                            <span class="text">Sign in with GitHub</span>
                        </Button>
                    {/if}
                    <Button size="m" text fullWidth on:click={() => (state = 'register')}>
                        Sign up instead
                    </Button>
                </Layout.Stack>
            {:else if state === 'register'}
                <Layout.Stack gap="l">
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter name"
                        autofocus
                        required
                        bind:value={name} />
                    <InputEmail
                        id="email"
                        label="Email"
                        placeholder="Enter email"
                        required
                        bind:value={mail} />
                    <InputPassword
                        id="password"
                        label="Password"
                        placeholder="Enter password"
                        required
                        bind:value={pass} />

                    <InputChoice required value={terms} id="terms" label="terms" showLabel={false}>
                        By registering, you agree that you have read, understand, and acknowledge
                        our <a
                            class="link"
                            href="https://appwrite.io/privacy"
                            target="_blank"
                            rel="noopener noreferrer">
                            Privacy Policy</a>
                        and accept our
                        <a
                            class="link"
                            href="https://appwrite.io/terms"
                            target="_blank"
                            rel="noopener noreferrer">General Terms of Use</a
                        >.</InputChoice>
                </Layout.Stack>

                <Layout.Stack gap="l">
                    <Button size="m" fullWidth submit>Sign up</Button>
                    <span class="with-separators eyebrow-heading-3">or</span>
                    {#if isCloud}
                        <Button size="m" secondary fullWidth on:click={onGithubAuth}>
                            <span class="icon-github" aria-hidden="true"></span>
                            <span class="text">Continue with GitHub</span>
                        </Button>
                    {/if}
                    <Button size="m" text fullWidth on:click={() => (state = 'login')}>
                        Sign in instead
                    </Button>
                </Layout.Stack>
            {:else if state === 'authenticated'}
                <Card variant="secondary" radius="s" padding="s">
                    <Layout.Stack gap="xxs">
                        <Layout.Stack direction="row" gap="xxs">
                            <Typography.Text variant="m-400">You're signed in as</Typography.Text>

                            <Typography.Text variant="m-500">
                                {data.account.email}
                            </Typography.Text>
                        </Layout.Stack>
                        <Link
                            variant="muted"
                            on:click={() => {
                                logout(false);
                                state = 'login';
                            }}>Switch account</Link>
                    </Layout.Stack>
                </Card>
            {/if}
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button on:click={requestAccess}>Request access</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    .preview-img {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top left;
    }
</style>
