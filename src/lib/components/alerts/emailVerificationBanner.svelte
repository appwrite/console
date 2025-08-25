<script lang="ts">
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { hideNotification, shouldShowNotification } from '$lib/helpers/notifications';
    import { user } from '$lib/stores/user';
    import { wizard } from '$lib/stores/wizard';
    import { page } from '$app/state';

    const { emailBannerClosed, onEmailBannerClose } = $props<{
        emailBannerClosed: boolean;
        onEmailBannerClose: (closed: boolean) => void;
    }>();

    const isOnOnboarding = $derived(() => page.route?.id?.includes('/(console)/onboarding'));

    const hasUser = $derived(!!$user);
    const needsEmailVerification = $derived($user && !$user.emailVerification);
    const shouldShowNotificationBanner = $derived.by(() =>
        shouldShowNotification('email-verification-banner')
    );
    const wizardNotActive = $derived(!$wizard.show && !$wizard.cover);
    const bannerNotClosed = $derived(!emailBannerClosed);
    const notOnOnboarding = $derived(!isOnOnboarding);

    const shouldShowEmailBanner = $derived(
        hasUser &&
            needsEmailVerification &&
            shouldShowNotificationBanner &&
            wizardNotActive &&
            bannerNotClosed &&
            notOnOnboarding
    );

    function navigateToAccount() {
        goto(`${base}/account`);
    }

    function handleDismiss() {
        onEmailBannerClose(true);
        hideNotification('email-verification-banner', { coolOffPeriod: 24 * 365 * 100 });
    }
</script>

{#if shouldShowEmailBanner}
    <HeaderAlert
        type="warning"
        title="Your email address needs to be verified"
        dismissible
        on:dismiss={handleDismiss}>
        <svelte:fragment>
            To avoid losing access to your projects, make sure <Typography.Text
                variant="m-500"
                style="display:inline">{$user.email}</Typography.Text> is valid and up to date. Email
            verification will be required soon.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button secondary size="s" on:click={navigateToAccount}>Update email address</Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
