<script lang="ts">
    import { invalidate, goto } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { get } from 'svelte/store';
    import { page } from '$app/stores';
    import Link from '$lib/elements/link.svelte';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Dependencies } from '$lib/constants';
    import { onMount, onDestroy } from 'svelte';
    import { base } from '$app/paths';
    import { browser } from '$app/environment';

    let { show = $bindable(false), email } = $props();
    let creating = $state(false);
    let emailSent = $state(false);
    let resendTimer = $state(0);
    let timerInterval: ReturnType<typeof setInterval> | null = null;

    async function logout(redirect = true) {
        try {
            await sdk.forConsole.account.deleteSession({ sessionId: 'current' });
            if (redirect) {
                await invalidate(Dependencies.ACCOUNT);
                goto(`${base}/login`);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    const cleanUrl = $derived($page.url.origin + $page.url.pathname);

    // Manage resend timer in localStorage
    const TIMER_END_KEY = 'email_verification_timer_end';
    const EMAIL_SENT_KEY = 'email_verification_sent';

    function startResendTimer() {
        const timerEndTime = Date.now() + 60 * 1000;
        resendTimer = 60;
        emailSent = true;
        if (browser) {
            localStorage.setItem(TIMER_END_KEY, timerEndTime.toString());
            localStorage.setItem(EMAIL_SENT_KEY, 'true');
        }
        startTimerCountdown(timerEndTime);
    }

    function restoreTimerState() {
        if (!browser) return;
        const savedTimerEnd = localStorage.getItem(TIMER_END_KEY);
        const savedEmailSent = localStorage.getItem(EMAIL_SENT_KEY);
        if (savedTimerEnd && savedEmailSent) {
            const timerEndTime = parseInt(savedTimerEnd);
            const now = Date.now();
            const remainingTime = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
            if (remainingTime > 0) {
                resendTimer = remainingTime;
                emailSent = true;
                startTimerCountdown(timerEndTime);
            } else {
                // Timer has expired, clean up
                localStorage.removeItem(TIMER_END_KEY);
                localStorage.removeItem(EMAIL_SENT_KEY);
                resendTimer = 0;
                emailSent = false;
            }
        }
    }

    function startTimerCountdown(timerEndTime: number) {
        timerInterval = setInterval(() => {
            const now = Date.now();
            const remainingTime = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
            resendTimer = remainingTime;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                if (browser) {
                    localStorage.removeItem(TIMER_END_KEY);
                    localStorage.removeItem(EMAIL_SENT_KEY);
                }
            }
        }, 1000);
    }

    async function onSubmit() {
        if (creating || resendTimer > 0) return;
        creating = true;
        try {
            await sdk.forConsole.account.createVerification({ url: cleanUrl });
            emailSent = true;
            startResendTimer();
        } catch (error) {
            console.error('Failed to send verification email:', error);
        } finally {
            creating = false;
        }
    }

    async function updateEmailVerification() {
        const searchParams = $page.url.searchParams;
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (userId && secret) {
            try {
                await sdk.forConsole.account.updateVerification({ userId, secret });
                await Promise.all([
                    invalidate(Dependencies.ACCOUNT),
                    invalidate(Dependencies.FACTORS)
                ]);

                goto(`${base}/`);
            } catch (error) {
                console.error('Failed to verify email:', error);
            }
        }
    }

    onMount(() => {
        updateEmailVerification();
        restoreTimerState(); // Check for existing timer
    });

    onDestroy(() => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        if (browser) {
            localStorage.removeItem(TIMER_END_KEY);
            localStorage.removeItem(EMAIL_SENT_KEY);
        }
    });
</script>

<div class="email-verification-scrim">
    <Modal
        bind:show
        title="Verify your email address"
        {onSubmit}
        dismissible={false}
        autoClose={false}>
        <Card.Base variant="secondary" padding="s">
            <Layout.Stack gap="s">
                <Typography.Text gap="m">
                    To continue using Appwrite Cloud, please verify your email address. An email
                    will be sent to <Typography.Text
                        variant="m-600"
                        color="neutral-secondary"
                        style="display: inline;">{email || get(user)?.email}</Typography.Text>
                </Typography.Text>
                <Layout.Stack class="u-margin-block-start-4 u-margin-block-end-24">
                    <Layout.Stack direction="row">
                        <Link variant="default" on:click={() => logout()}>Switch account</Link>
                    </Layout.Stack>
                </Layout.Stack>
                {#if emailSent && resendTimer > 0}
                    <Typography.Text color="neutral-secondary">
                        Didn't get the email? Try again in {resendTimer}s
                    </Typography.Text>
                {/if}
            </Layout.Stack>
        </Card.Base>

        <svelte:fragment slot="footer">
            <Button submit disabled={creating || resendTimer > 0}>
                {emailSent ? 'Resend email' : 'Send email'}
            </Button>
        </svelte:fragment>
    </Modal>
</div>

<style>
    .email-verification-scrim {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: hsl(240 5% 8% / 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
