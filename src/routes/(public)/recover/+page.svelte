<script lang="ts">
    import { base } from '$app/paths';
    import { Button, Form, InputEmail, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Divider, Layout, Link } from '@appwrite.io/pink-svelte';

    let email: string;
    let userId: string;
    let secret: string;

    let password: string;
    let confirmPassword: string;

    onMount(() => {
        userId = page.url.searchParams.get('userId');
        secret = page.url.searchParams.get('secret');
    });

    async function recover() {
        try {
            await sdk.forConsole.account.createRecovery(email, window.location.toString());
            addNotification({
                type: 'success',
                message: 'We have sent you an email with a password reset link'
            });
            trackEvent(Submit.AccountRecover);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountRecover);
        }
    }

    async function setPassword() {
        try {
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            await sdk.forConsole.account.updateRecovery(userId, secret, password);
            await goto(`${base}/login`);
            addNotification({
                type: 'success',
                message: 'Password has been updated successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<svelte:head>
    <title>Recover - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Password recovery</svelte:fragment>
    <svelte:fragment>
        {#if userId && secret}
            <Form onSubmit={setPassword}>
                <Layout.Stack>
                    <InputPassword
                        label="New password"
                        placeholder="Enter password"
                        id="password"
                        autofocus={true}
                        required={true}
                        bind:value={password} />
                    <InputPassword
                        label="Confirm password"
                        placeholder="Confirm password"
                        id="confirm-password"
                        required={true}
                        bind:value={confirmPassword} />

                    <Button fullWidth submit>Update</Button>
                </Layout.Stack>
            </Form>
        {:else}
            <Form onSubmit={recover}>
                <Layout.Stack>
                    <InputEmail
                        id="email"
                        label="Email"
                        placeholder="Email"
                        autofocus={true}
                        required={true}
                        bind:value={email} />

                    <Button fullWidth submit>Recover</Button>
                </Layout.Stack>
            </Form>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="links">
        <Layout.Stack direction="row" justifyContent="center" alignItems="center">
            <Link.Anchor href={`${base}/login`} variant="quiet">Sign in</Link.Anchor>
            <div style:height="20px">
                <Divider vertical />
            </div>
            <Link.Anchor href={`${base}/register`} variant="quiet">Sign up</Link.Anchor>
        </Layout.Stack>
    </svelte:fragment>
</Unauthenticated>
