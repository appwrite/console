<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { user } from '$lib/stores/user';
    import SendVerificationEmailModal from '../account/sendVerificationEmailModal.svelte';
    import { page } from '$app/state';
    import { wizard, isNewWizardStatusOpen } from '$lib/stores/wizard';
    import { isCloud, isProductionCloud, VARS } from '$lib/system';

    const hasUser = $derived(!!$user);
    const needsEmailVerification = $derived(hasUser && !$user.emailVerification);
    const notOnOnboarding = $derived(!page.route.id.includes('/onboarding'));
    const notOnWizard = $derived(!$wizard.show && !$isNewWizardStatusOpen);
    const isEnabledViaEnvConfig = $derived(VARS.EMAIL_VERIFICATION);
    const shouldShowEmailBanner = $derived(
        isEnabledViaEnvConfig &&
            isCloud &&
            hasUser &&
            needsEmailVerification &&
            notOnOnboarding &&
            notOnWizard
    );

    let showSendVerification = $state(false);
    let isProduction = $derived(isProductionCloud(page.url));
</script>

{#if shouldShowEmailBanner && isProduction}
    <HeaderAlert type="warning" title="Your email address needs to be verified">
        <svelte:fragment>
            To avoid losing access to your projects, make sure <Typography.Text
                variant="m-500"
                style="display:inline">{$user.email}</Typography.Text> is valid and up to date. Email
            verification will be required soon.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button secondary size="s" on:click={() => (showSendVerification = true)}
                >Verify email</Button>
        </svelte:fragment>
    </HeaderAlert>
    <SendVerificationEmailModal bind:show={showSendVerification} />
{/if}
