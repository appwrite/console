<script lang="ts">
    import { invalidate, goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputEmail, InputPassword } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { get } from 'svelte/store';
    import { page } from '$app/state';
    import Link from '$lib/elements/link.svelte';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Dependencies } from '$lib/constants';
    import { onMount, onDestroy } from 'svelte';
    import { resolve } from '$app/paths';
    import { browser } from '$app/environment';
    import { slide } from 'svelte/transition';

    let {
        show = $bindable(false),
        email
    }: {
        show?: boolean;
        email?: string;
    } = $props();

    let error = $state(null);
    let creating = $state(false);
    let emailSent = $state(false);
    let resendTimer = $state(0);
    let timerInterval: ReturnType<typeof setInterval> | null = null;

    let showUpdateEmail = $state(false);
    let newEmail = $state('');
    let newPassword = $state('');
    let updating = $state(false);

    $effect(() => {
        if (showUpdateEmail) {
            newEmail = email || get(user)?.email || '';
        }
    });

    async function logout() {
        error = null;
        try {
            await sdk.forConsole.account.deleteSession({ sessionId: 'current' });
            await invalidate(Dependencies.ACCOUNT);
            await goto(resolve('/login'));
        } catch (err) {
            error = err.message;
        }
    }

    const cleanUrl = $derived(page.url.origin + page.url.pathname);

    // manage resend timer in localStorage
    const EMAIL_SENT_KEY = 'email_verification_sent';
    const TIMER_END_KEY = 'email_verification_timer_end';

    function startResendTimer() {
        resendTimer = 60;
        emailSent = true;
        const timerEndTime = Date.now() + 60 * 1000;

        if (browser) {
            localStorage.setItem(EMAIL_SENT_KEY, 'true');
            localStorage.setItem(TIMER_END_KEY, timerEndTime.toString());
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
                // timer has expired, clean up
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
        error = null;
        creating = true;
        try {
            await sdk.forConsole.account.createVerification({ url: cleanUrl });
            emailSent = true;
            startResendTimer();
        } catch (err) {
            error = err.message;
        } finally {
            creating = false;
        }
    }

    async function updateEmail() {
        error = null;
        updating = true;
        try {
            await sdk.forConsole.account.updateEmail({
                email: newEmail,
                password: newPassword
            });
            await invalidate(Dependencies.ACCOUNT);
            trackEvent(Submit.AccountUpdateEmail);
            resetUpdateEmailForm();
        } catch (err) {
            error = err.message;
            trackError(err, Submit.AccountUpdateEmail);
        } finally {
            updating = false;
        }
    }

    function resetUpdateEmailForm() {
        showUpdateEmail = false;
        newEmail = '';
        newPassword = '';
        error = null;
    }

    onMount(restoreTimerState);

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
    {#if !showUpdateEmail}
        <Modal
            bind:show
            bind:error
            title="Verify your email address"
            {onSubmit}
            dismissible={false}
            autoClose={false}
            backdrop={false}>
            <Card.Base variant="secondary" padding="s">
                <Layout.Stack gap="xxs">
                    <Typography.Text gap="m">
                        To continue using Appwrite Cloud, please verify your email address. An email
                        will be sent to <Typography.Text
                            variant="m-600"
                            color="neutral-secondary"
                            style="display: inline;">{email || get(user)?.email}</Typography.Text>
                    </Typography.Text>

                    <Typography.Text>
                        Wrong email? <Link
                            variant="default"
                            on:click={() => {
                                showUpdateEmail = true;
                                error = null;
                            }}>Update email address</Link> or <Link
                            variant="default"
                            on:click={() => logout()}>Switch account</Link>
                    </Typography.Text>

                    {#if emailSent && resendTimer > 0}
                        <div transition:slide={{ duration: 150 }}>
                            <Typography.Text
                                color="neutral-secondary"
                                style="margin-block-start: var(--gap-L, 16px);">
                                Didn't get the email? Try again in {resendTimer}s
                            </Typography.Text>
                        </div>
                    {/if}
                </Layout.Stack>
            </Card.Base>

            <svelte:fragment slot="footer">
                <Button
                    submit
                    submissionLoader
                    forceShowLoader={creating}
                    disabled={creating || resendTimer > 0}>
                    {emailSent ? 'Resend email' : 'Send email'}
                </Button>
            </svelte:fragment>
        </Modal>
    {:else}
        <Modal
            bind:show={showUpdateEmail}
            bind:error
            title="Update email address"
            onSubmit={updateEmail}
            autoClose={false}
            backdrop={false}>
            <InputEmail
                id="new-email"
                label="Email"
                placeholder="Enter email"
                bind:value={newEmail}
                required
                helper="You'll need access to this email to verify your account" />
            <InputPassword
                id="update-password"
                label="Password"
                placeholder="Enter password"
                required
                bind:value={newPassword} />

            <svelte:fragment slot="footer">
                <Button text on:click={resetUpdateEmailForm}>Cancel</Button>
                <Button submit submissionLoader forceShowLoader={updating} disabled={updating}
                    >Update</Button>
            </svelte:fragment>
        </Modal>
    {/if}
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

    /* avoids the background scroll and bars */
    :global(html:has(.email-verification-scrim)) {
        height: 100%;
        overflow: hidden !important;
    }
</style>
