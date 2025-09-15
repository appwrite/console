<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { user } from '$lib/stores/user';
    import SendVerificationEmailModal from '../account/sendVerificationEmailModal.svelte';
    import { page } from '$app/stores';

    const hasUser = $derived(!!$user);
    const needsEmailVerification = $derived(hasUser && !$user.emailVerification);
    const notOnOnboarding = $derived(!$page.route.id.includes('/onboarding'));
    const shouldShowEmailBanner = $derived(hasUser && needsEmailVerification && notOnOnboarding);

    let showSendVerification = $state(false);
</script>

{#if shouldShowEmailBanner}
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
