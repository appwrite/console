<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, EyebrowHeading, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputChoice } from '$lib/elements/forms';
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

    <svelte:fragment slot="aside">
        <div class="u-flex u-flex-vertical u-gap-32">
            <div class="u-flex u-flex-vertical u-gap-16">
                <FormList>
                    <InputChoice
                        on:change={updateMfa}
                        type="switchbox"
                        id="mfa"
                        label="Multi-factor authentication"
                        value={$user.mfa} />
                </FormList>
                <p>
                    Two-factor authentication enhances your account's security by requiring a second
                    sign-in method. <Button
                        link
                        external
                        href="https://appwrite.io/docs/products/auth/mfa">Learn more.</Button>
                </p>
            </div>
            {#if $user.mfa}
                <div class="u-flex-vertical u-gap-16">
                    <div class="u-sep-block-end" style="padding-block-end: 8px;">
                        <EyebrowHeading tag="h3" size={3} class="u-normal">Methods</EyebrowHeading>
                    </div>
                    <div
                        class="method u-flex u-flex-vertical-mobile u-gap-16 u-main-space-between u-sep-block-end"
                        style="padding-block-end: 16px">
                        <div class="u-flex u-gap-8 u-cross-baseline">
                            <div class="avatar is-size-x-small">
                                <span class="icon-device-mobile" aria-hidden="true" />
                            </div>
                            <div class="u-flex-vertical u-gap-4">
                                <div class="u-flex u-gap-4 u-cross-center">
                                    <span class="body-text-2 u-bold">Authenticator app</span>
                                    {#if $factors.totp}
                                        <Pill>connected</Pill>
                                    {/if}
                                </div>
                                <span class="body-text-2"
                                    >Use an authentication app to generate two-factor authentication
                                    codes.</span>
                            </div>
                        </div>
                        <div class="method-button">
                            {#if $factors.totp}
                                <Button
                                    text
                                    class="is-not-mobile"
                                    on:click={() => (showDelete = true)}>Delete</Button>
                                <Button
                                    text
                                    class="is-only-mobile"
                                    on:click={() => (showDelete = true)}>Delete</Button>
                            {:else}
                                <Button secondary on:click={() => (showSetup = true)}>Add</Button>
                            {/if}
                        </div>
                    </div>

                    {#if $factors.email}
                        <div
                            class="u-flex u-main-space-between u-sep-block-end"
                            style="padding-block-end: 16px">
                            <div class="u-flex u-gap-8 u-cross-baseline">
                                <div class="avatar is-size-x-small">
                                    <span class="icon-mail" aria-hidden="true" />
                                </div>
                                <div class="u-flex-vertical u-gap-4">
                                    <div class="u-flex u-gap-4 u-cross-center">
                                        <span class="body-text-2 u-bold">Email</span>
                                        <Pill>verified</Pill>
                                    </div>
                                    <span>One-time codes will be sent to: {$user.email}</span>
                                </div>
                            </div>
                        </div>
                    {:else if !$user.emailVerification}
                        <div
                            class="u-flex u-main-space-between u-sep-block-end"
                            style="padding-block-end: 16px">
                            <div class="u-flex u-gap-8 u-cross-baseline">
                                <div class="avatar is-size-x-small">
                                    <span class="icon-mail" aria-hidden="true" />
                                </div>
                                <div class="u-flex-vertical u-gap-4">
                                    <div class="u-flex u-gap-4 u-cross-center">
                                        <span class="body-text-2 u-bold">Email</span>
                                        <Pill>unverified</Pill>
                                    </div>
                                    <span>Verify your email to receive login MFA codes.</span>
                                </div>
                            </div>
                            <Button
                                secondary
                                disabled={creatingVerification}
                                on:click={() => createVerification()}>Verify</Button>
                        </div>
                    {/if}

                    {#if $factors.phone}
                        <div
                            class="u-flex u-main-space-between u-sep-block-end"
                            style="padding-block-end: 16px">
                            <div class="u-flex u-gap-8 u-cross-baseline">
                                <div class="avatar is-size-x-small">
                                    <span class="icon-send" aria-hidden="true" />
                                </div>
                                <div class="u-flex-vertical u-gap-4">
                                    <div class="u-flex u-gap-4 u-cross-center">
                                        <span class="body-text-2 u-bold">SMS</span>
                                        <Pill>verified</Pill>
                                    </div>
                                    <span>One-time codes will be sent to: {$user.phone}</span>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>

                {#if enabledMethods.length > 0}
                    <div class="u-flex-vertical u-gap-16">
                        <div class="u-sep-block-end" style="padding-block-end: 8px;">
                            <EyebrowHeading tag="h6" size={3} class="u-normal"
                                >Recovery</EyebrowHeading>
                        </div>
                        <div
                            class="method u-flex u-flex-vertical-mobile u-gap-16 u-main-space-between u-sep-block-end"
                            style="padding-block-end: 16px">
                            <div class="u-flex u-gap-8 u-cross-baseline">
                                <div class="avatar is-size-x-small">
                                    <span class="icon-lock-open" aria-hidden="true" />
                                </div>
                                <div class="u-flex-vertical u-gap-4 body-text-2">
                                    <span class="u-bold">Recovery codes</span>
                                    <span
                                        >Use in case you can't receive two-factor authentication
                                        codes.</span>
                                </div>
                            </div>
                            <div class="method-button">
                                {#if $factors.recoveryCode}
                                    <Button
                                        class="method-button is-not-mobile"
                                        text
                                        on:click={() => (showRegenerateRecoveryCodes = true)}
                                        >Regenerate</Button>
                                    <Button
                                        class="method-button is-only-mobile"
                                        text
                                        on:click={() => (showRegenerateRecoveryCodes = true)}
                                        >Regenerate</Button>
                                {:else}
                                    <Button
                                        class="method-button"
                                        secondary
                                        on:click={createRecoveryCodes}>View</Button>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
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

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';

    /* Default (including mobile) */
    .method {
        align-items: start;
        .method-button {
            margin-inline-start: 2rem;
        }
    }

    /* for smaller screens */
    @media #{devices.$break2open} {
        .method {
            align-items: center;
        }
    }
</style>
