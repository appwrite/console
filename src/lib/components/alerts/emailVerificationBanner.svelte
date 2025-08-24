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

    export let emailBannerClosed: boolean;
    export let onEmailBannerClose: (closed: boolean) => void;

    $: isOnOnboarding = page.route?.id?.includes('/(console)/onboarding');

    $: shouldShowEmailBanner =
        $user &&
        !$user.emailVerification &&
        shouldShowNotification('email-verification-banner') &&
        !$wizard.show &&
        !$wizard.cover &&
        !emailBannerClosed &&
        !isOnOnboarding;

    function navigateToAccount() {
        goto(`${base}/account`);
    }

    function handleDismiss() {
        onEmailBannerClose(true);
        hideNotification('email-verification-banner', { coolOffPeriod: 24 });
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
