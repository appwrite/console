<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { AuthenticationFactor, type Models } from '@appwrite.io/console';
    import { InputDigits } from '$lib/elements/forms';

    export async function verify(
        challenge: Models.MfaChallenge,
        code: string,
        challengeType: AuthenticationFactor = AuthenticationFactor.Totp
    ) {
        try {
            if (!challenge) {
                challenge = await sdk.forConsole.account.createMFAChallenge({
                    factor: challengeType
                });
            }

            await sdk.forConsole.account.updateMFAChallenge({
                challengeId: challenge.$id,
                otp: code
            });

            await invalidate(Dependencies.ACCOUNT);
            trackEvent(Submit.AccountLogin, { mfa_used: true });
        } catch (error) {
            trackError(error, Submit.AccountLogin);
            throw error;
        }
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { Icon, Typography } from '@appwrite.io/pink-svelte';
    import { IconChatAlt, IconDeviceMobile, IconMail } from '@appwrite.io/pink-icons-svelte';

    export let factors: Models.MfaFactors & { recoveryCode: boolean };
    export let showVerifyButton: boolean = true;
    export let disabled: boolean = false;
    export let challenge: Models.MfaChallenge;
    export let code: string;

    let challengeType: AuthenticationFactor;

    // Get enabled non-recovery factors for main factors
    $: enabledMainFactors = [
        factors.totp && 'totp',
        factors.email && 'email',
        factors.phone && 'phone'
    ].filter(Boolean);

    async function createChallenge(factor: AuthenticationFactor) {
        disabled = true;
        challengeType = factor;
        code = '';
        try {
            if (
                factor !== AuthenticationFactor.Totp &&
                factor !== AuthenticationFactor.Recoverycode
            ) {
                challenge = await sdk.forConsole.account.createMFAChallenge({ factor });
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            disabled = false;
        }
    }

    function switchToFactor(factor: AuthenticationFactor) {
        createChallenge(factor);
    }

    export async function verifyCurrent() {
        return verify(challenge, code, challengeType);
    }

    onMount(async () => {
        if (enabledMainFactors.length === 0) {
            return;
        }

        if (factors.totp) {
            challengeType = AuthenticationFactor.Totp;
        } else if (factors.email) {
            await createChallenge(AuthenticationFactor.Email);
        } else if (factors.phone) {
            await createChallenge(AuthenticationFactor.Phone);
        }
    });
</script>

{#if enabledMainFactors.length === 0}
    <!-- Skip MFA completely if no factors enabled -->
{:else if challengeType === AuthenticationFactor.Recoverycode}
    <Typography.Text align="center">
        Enter one of the recovery codes you received when enabling MFA.
    </Typography.Text>
    <InputText id="recovery-code" bind:value={code} required autofocus />
{:else if challengeType === AuthenticationFactor.Totp}
    <Typography.Text align="center">
        Enter a 6-digit one-time code from your authenticator app.
    </Typography.Text>
    <InputDigits bind:value={code} required autofocus />
{:else if challengeType === AuthenticationFactor.Email}
    <Typography.Text align="center">
        A 6-digit verification code was sent to your email. Enter it below.
    </Typography.Text>
    <InputDigits bind:value={code} required autofocus />
{:else if challengeType === AuthenticationFactor.Phone}
    <Typography.Text align="center">
        A 6-digit verification code was sent to your phone. Enter it below.
    </Typography.Text>
    <InputDigits bind:value={code} required autofocus />
{/if}

{#if showVerifyButton && enabledMainFactors.length > 0}
    <Button fullWidth submit {disabled}>Verify</Button>
{/if}

{#if enabledMainFactors.length > 0}
    {@const hasSecondaryOptions =
        enabledMainFactors.length > 1 ||
        (factors.recoveryCode && challengeType !== AuthenticationFactor.Recoverycode) ||
        (enabledMainFactors.length === 1 && factors.recoveryCode)}

    {#if hasSecondaryOptions}
        <span class="with-separators eyebrow-heading-3">or</span>
        <div class="u-flex-vertical u-gap-8">
            <!-- Show non-active main factors -->
            {#if factors.totp && challengeType !== AuthenticationFactor.Totp}
                <Button
                    secondary
                    fullWidth
                    {disabled}
                    on:click={() => switchToFactor(AuthenticationFactor.Totp)}>
                    <Icon icon={IconDeviceMobile} slot="start" size="s" />
                    Authenticator app
                </Button>
            {/if}

            {#if factors.email && challengeType !== AuthenticationFactor.Email}
                <Button
                    secondary
                    fullWidth
                    {disabled}
                    on:click={() => switchToFactor(AuthenticationFactor.Email)}>
                    <Icon icon={IconMail} slot="start" size="s" />
                    Email verification
                </Button>
            {/if}

            {#if factors.phone && challengeType !== AuthenticationFactor.Phone}
                <Button
                    secondary
                    fullWidth
                    {disabled}
                    on:click={() => switchToFactor(AuthenticationFactor.Phone)}>
                    <Icon icon={IconChatAlt} slot="start" size="s" />
                    Phone verification
                </Button>
            {/if}

            {#if factors.recoveryCode && challengeType !== AuthenticationFactor.Recoverycode}
                <Button
                    text
                    fullWidth
                    {disabled}
                    on:click={() => switchToFactor(AuthenticationFactor.Recoverycode)}>
                    <span class="text">Use recovery code</span>
                </Button>
            {/if}
        </div>
    {/if}
{/if}
