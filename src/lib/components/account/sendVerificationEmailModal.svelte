<script lang="ts">
    import { invalidate, goto } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { get } from 'svelte/store';
    import { page } from '$app/state';
    import Link from '$lib/elements/link.svelte';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Dependencies } from '$lib/constants';
    import { onDestroy } from 'svelte';
    import { resolve } from '$app/paths';
    import ResendCooldown from '$lib/components/resendCooldown.svelte';

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

    // Timer UI handled by ResendCooldown component

    async function onSubmit() {
        if (creating) return;
        error = null;
        creating = true;
        try {
            await sdk.forConsole.account.createVerification({ url: cleanUrl });
            emailSent = true;
        } catch (err) {
            error = err.message;
        } finally {
            creating = false;
        }
    }

    onDestroy(() => {});
</script>

<div class="email-verification-scrim">
    <Modal
        bind:show
        bind:error
        title="Verify your email address"
        {onSubmit}
        dismissible={false}
        autoClose={false}>
        <Card.Base variant="secondary" padding="s">
            <Layout.Stack gap="xxs">
                <Typography.Text gap="m">
                    To continue using Appwrite Cloud, please verify your email address. An email
                    will be sent to <Typography.Text
                        variant="m-600"
                        color="neutral-secondary"
                        style="display: inline;">{email || get(user)?.email}</Typography.Text>
                </Typography.Text>

                <Link variant="default" on:click={() => logout()}>Switch account</Link>
            </Layout.Stack>
        </Card.Base>

        <svelte:fragment slot="footer">
            {#if emailSent}
                <ResendCooldown
                    storageKey="email_verification_resend"
                    seconds={60}
                    bind:disabled={creating}
                    onResend={onSubmit} />
            {:else}
                <Button submit submissionLoader forceShowLoader={creating} disabled={creating}>
                    Send email
                </Button>
            {/if}
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

    /* avoids the background scroll and bars */
    :global(html:has(.email-verification-scrim)) {
        height: 100%;
        overflow: hidden !important;
    }
</style>
