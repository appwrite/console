<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, EyebrowHeading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import Mfa from './mfa.svelte';
    import DeleteMfa from './deleteMfa.svelte';
    import { factors } from './store';
    import MfaRecoveryCodes from './mfaRecoveryCodes.svelte';
    import type { Models } from '@appwrite.io/console';
    import MfaRegenerateCodes from './mfaRegenerateCodes.svelte';
    import { Pill } from '$lib/elements';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { Badge, Divider, Layout, Link, Typography } from '@appwrite.io/pink-svelte';

    let showSetup: boolean = false;
    let showDelete: boolean = false;
    let showRecoveryCodes = false;
    let showRegenerateRecoveryCodes = false;
    let codes: Models.MfaRecoveryCodes = null;

    $: enabledFactors = Object.entries($factors)
        .filter(([_, enabled]) => enabled)
        .map(([factor, _]) => factor);
    $: enabledMethods = enabledFactors.filter((factor) => factor !== 'recoveryCode');

    $: cleanUrl = $page.url.origin + $page.url.pathname;

    let creatingVerification = false;

    async function createVerification() {
        creatingVerification = true;

        try {
            await sdk.forConsole.account.createVerification(cleanUrl);
            addNotification({
                message: 'Verification email has been sent',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        } finally {
            creatingVerification = false;
        }
    }

    async function updateEmailVerification() {
        const searchParams = $page.url.searchParams;
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        history.replaceState(null, '', cleanUrl);

        if (userId && secret) {
            try {
                await sdk.forConsole.account.updateVerification(userId, secret);
                addNotification({
                    message: 'Email verified successfully',
                    type: 'success'
                });
                await Promise.all([
                    invalidate(Dependencies.ACCOUNT),
                    invalidate(Dependencies.FACTORS)
                ]);
            } catch (error) {
                addNotification({
                    message: error.message,
                    type: 'error'
                });
            }
        }
    }

    async function updateMfa() {
        try {
            await sdk.forConsole.account.updateMFA(!$user.mfa);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                message: `Multi-factor authentication has been ${$user.mfa ? 'enabled' : 'disabled'}`,
                type: 'success'
            });
            trackEvent(Submit.AccountUpdateMfa, { mfa: !$user.mfa });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountUpdateMfa);
        }
    }

    async function createRecoveryCodes() {
        try {
            codes = await sdk.forConsole.account.createMfaRecoveryCodes();
            showRecoveryCodes = true;
            Promise.all([invalidate(Dependencies.ACCOUNT), invalidate(Dependencies.FACTORS)]);
            trackEvent(Submit.AccountRecoveryCodesCreate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountRecoveryCodesCreate);
        }
    }

    async function regenerateRecoveryCodes() {
        try {
            codes = await sdk.forConsole.account.updateMfaRecoveryCodes();
            showRecoveryCodes = true;
            Promise.all([invalidate(Dependencies.ACCOUNT), invalidate(Dependencies.FACTORS)]);
            trackEvent(Submit.AccountRecoveryCodesUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountRecoveryCodesUpdate);
        }
    }

    $: if (!showRecoveryCodes) {
        codes = null;
    }

    onMount(() => {
        updateEmailVerification();
    });
</script>

<CardGrid>
    <svelte:fragment slot="title">Multi-factor authentication</svelte:fragment>
    Enhance your account's security by requiring a second sign-in method.
    <Link.Anchor
        target="_blank"
        rel="noopener noreferrer"
        href="https://appwrite.io/docs/products/auth/mfa">Learn more</Link.Anchor>
    <svelte:fragment slot="aside">
        <Layout.Stack gap="xl">
            <InputChoice
                on:change={updateMfa}
                type="switchbox"
                id="mfa"
                label="Multi-factor authentication"
                value={$user.mfa} />
            <Layout.Stack gap="xl">
                {#if $user.mfa}
                    <Layout.Stack>
                        <EyebrowHeading tag="h3" size={3} class="u-normal">Methods</EyebrowHeading>
                        <Layout.Stack direction="row">
                            <div class="avatar is-size-x-small">
                                <span class="icon-device-mobile" aria-hidden="true"></span>
                            </div>
                            <Layout.Stack gap="xxxs">
                                <Layout.Stack gap="s">
                                    <Typography.Text variant="m-600"
                                        >Authenticator app</Typography.Text>
                                    {#if $factors.totp}
                                        <Pill>connected</Pill>
                                    {/if}
                                </Layout.Stack>
                                <Typography.Text variant="m-400">
                                    Use an authentication app to generate two-factor authentication
                                    codes.
                                </Typography.Text>
                            </Layout.Stack>
                            <div>
                                {#if $factors.totp}
                                    <Button
                                        text
                                        class="is-not-mobile"
                                        on:click={() => (showDelete = true)}>Delete</Button>
                                {:else}
                                    <Button secondary on:click={() => (showSetup = true)}
                                        >Add</Button>
                                {/if}
                            </div>
                        </Layout.Stack>

                        <Divider />

                        {#if $factors.email}
                            <Layout.Stack>
                                <Layout.Stack direction="row">
                                    <div class="avatar is-size-x-small">
                                        <span class="icon-mail" aria-hidden="true"></span>
                                    </div>
                                    <Layout.Stack gap="xxxs">
                                        <Layout.Stack gap="s" direction="row">
                                            <Typography.Text variant="m-600">Email</Typography.Text>
                                            <Badge
                                                variant="secondary"
                                                content="verified"
                                                size="s" />
                                        </Layout.Stack>
                                        <Typography.Text variant="m-400">
                                            One-time codes will be sent to: {$user.email}
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Layout.Stack>
                            </Layout.Stack>
                        {:else if !$user.emailVerification}
                            <Layout.Stack>
                                <Layout.Stack direction="row">
                                    <div class="avatar is-size-x-small">
                                        <span class="icon-mail" aria-hidden="true"></span>
                                    </div>
                                    <Layout.Stack gap="xxxs">
                                        <Layout.Stack gap="s" direction="row">
                                            <Typography.Text variant="m-600">Email</Typography.Text>
                                            <Badge
                                                variant="secondary"
                                                size="s"
                                                content="unverified" />
                                        </Layout.Stack>
                                        <Typography.Text variant="m-400">
                                            Verify your email to receive login MFA codes.
                                        </Typography.Text>
                                    </Layout.Stack>
                                    <div>
                                        <Button
                                            secondary
                                            disabled={creatingVerification}
                                            on:click={() => createVerification()}>Verify</Button>
                                    </div>
                                </Layout.Stack>
                            </Layout.Stack>
                        {/if}

                        {#if $factors.phone}
                            <Layout.Stack>
                                <Layout.Stack direction="row">
                                    <div class="avatar is-size-x-small">
                                        <span class="icon-send" aria-hidden="true"></span>
                                    </div>
                                    <Layout.Stack gap="xxxs">
                                        <Layout.Stack gap="s" direction="row">
                                            <Typography.Text variant="m-600">SMS</Typography.Text>
                                            <Badge
                                                variant="secondary"
                                                size="s"
                                                content="verified" />
                                        </Layout.Stack>
                                        <Typography.Text variant="m-400">
                                            One-time codes will be sent to: {$user.phone}
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Layout.Stack>
                            </Layout.Stack>
                        {/if}
                    </Layout.Stack>

                    {#if enabledMethods.length >= 0}
                        <Layout.Stack class="method">
                            <EyebrowHeading tag="h6" size={3} class="u-normal"
                                >Recovery</EyebrowHeading>
                            <Layout.Stack>
                                <Layout.Stack direction="row">
                                    <div class="avatar is-size-x-small">
                                        <span class="icon-lock-open" aria-hidden="true"></span>
                                    </div>
                                    <Layout.Stack gap="xxxs">
                                        <Layout.Stack gap="s" direction="row">
                                            <Typography.Text variant="m-600"
                                                >Recovery codes</Typography.Text>
                                        </Layout.Stack>
                                        <Typography.Text variant="m-400">
                                            Use in case you can't receive two-factor authentication
                                            codes.
                                        </Typography.Text>
                                    </Layout.Stack>
                                    {#if $factors.recoveryCode}
                                        <Button
                                            secondary
                                            class="recovery-codes-button"
                                            on:click={() => (showRegenerateRecoveryCodes = true)}>
                                            Regenerate
                                        </Button>
                                    {:else}
                                        <Button
                                            secondary
                                            class="recovery-codes-button"
                                            on:click={createRecoveryCodes}>View</Button>
                                    {/if}
                                </Layout.Stack>
                            </Layout.Stack>
                        </Layout.Stack>
                    {/if}
                {/if}
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>
</CardGrid>

{#if showSetup}
    <Mfa bind:showSetup />
{/if}
<DeleteMfa bind:showDelete />

<MfaRecoveryCodes bind:showRecoveryCodes {codes} />
<MfaRegenerateCodes
    bind:show={showRegenerateRecoveryCodes}
    {regenerateRecoveryCodes}
    factors={$factors} />

<style>
    :global(.recovery-codes-button) {
        height: fit-content;
        margin-inline-start: 0.5rem;
        padding-inline: 1rem !important;
    }
</style>
