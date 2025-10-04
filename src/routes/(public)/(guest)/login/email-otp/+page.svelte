<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { InputDigits, Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { redirectTo } from '$routes/store';
    import { user } from '$lib/stores/user';
    import { Layout, Typography, Link } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';

    let otpCode: string = '';
    let disabled: boolean = false;
    let email: string = '';
    let userId: string = '';

    export let data;

    // Get email and userId from URL params
    $: email = page.url.searchParams.get('email') || '';
    $: userId = page.url.searchParams.get('userId') || '';

    async function verifyOTP() {
        try {
            disabled = true;
            // Use createSession with the userId from createEmailToken
            await sdk.forConsole.account.createSession({ userId: userId, secret: otpCode });

            if ($user) {
                trackEvent(Submit.AccountLogin, { mfa_used: 'none' });
                addNotification({
                    type: 'success',
                    message: 'Successfully logged in.'
                });
            }

            if (data?.couponData?.code) {
                trackEvent(Submit.AccountCreate, {
                    campaign_name: data?.couponData?.code,
                    email: email,
                    name: $user?.name
                });
                await goto(`${base}/apply-credit?code=${data?.couponData?.code}`);
                return;
            }
            if (data?.campaign?.$id) {
                await goto(`${base}/apply-credit?campaign=${data.campaign?.$id}`);
                return;
            }
            if ($redirectTo) {
                window.location.href = $redirectTo;
                return;
            }

            await invalidate(Dependencies.ACCOUNT);
        } catch (error) {
            disabled = false;
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountLogin);
        }
    }

    async function resendCode() {
        try {
            disabled = true;
            const sessionToken = await sdk.forConsole.account.createEmailToken({
                userId: 'unique',
                email: email
            });
            userId = sessionToken.userId;

            addNotification({
                type: 'success',
                message: 'New sign in code sent to your email.'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            disabled = false;
        }
    }
</script>

<svelte:head>
    <title>Enter your sign-in code - Appwrite</title>
</svelte:head>

<Unauthenticated coupon={data?.couponData} campaign={data?.campaign} align="center">
    <svelte:fragment slot="title">Enter your sign-in code</svelte:fragment>
    <svelte:fragment>
        <Layout.Stack gap="l" justifyContent="center" alignContent="center" alignItems="center">
            <Typography.Text align="center">
                We sent a 6-digit code to {email}
            </Typography.Text>

            <form on:submit|preventDefault={verifyOTP}>
                <Layout.Stack align="center">
                    <InputDigits bind:value={otpCode} required />
                    <Button submit {disabled} class="verify-button">Verify</Button>
                </Layout.Stack>
            </form>

            <Typography.Text align="center">
                Didn't get it?
                <Link.Button on:click={resendCode} {disabled}>Resend code</Link.Button>
            </Typography.Text>
        </Layout.Stack>
    </svelte:fragment>
</Unauthenticated>
