<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form, FormList, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Alert } from '$lib/components';
    import LL from '$i18n/i18n-svelte';

    let teamId: string, membershipId: string, userId: string, secret: string;
    let terms = false;

    onMount(() => {
        userId = $page.url.searchParams.get('userId');
        secret = $page.url.searchParams.get('secret');
        teamId = $page.url.searchParams.get('teamId');
        membershipId = $page.url.searchParams.get('membershipId');
    });

    const acceptInvite = async () => {
        try {
            await sdk.forConsole.teams.updateMembershipStatus(teamId, membershipId, userId, secret);
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            await goto(`${base}/console/organization-${teamId}`);
            trackEvent(Submit.MembershipUpdateStatus);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MembershipUpdateStatus);
        }
    };
</script>

<svelte:head>
    <title>{$LL.invite.title.pageHeader()} - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">
        {#if !userId || !secret || !membershipId || !teamId}
            {$LL.invite.title.invalidInvite()}
        {:else}
            {$LL.invite.title.invite()}
        {/if}
    </svelte:fragment>
    <svelte:fragment>
        {#if !userId || !secret || !membershipId || !teamId}
            <Alert type="warning">
                <svelte:fragment slot="title"
                    >{$LL.invite.alerts.warningAlert.phraseOne()}</svelte:fragment>
                {$LL.invite.alerts.warningAlert.phraseTwo()}
            </Alert>
            <div class="u-flex u-main-end u-margin-block-start-40">
                <Button href={`${base}/register`}>{$LL.invite.button.accept.register()}</Button>
            </div>
        {:else}
            <p class="text">{$LL.invite.alerts.successAlert()}</p>
            <Form onSubmit={acceptInvite}>
                <FormList>
                    <InputChoice
                        required
                        bind:value={terms}
                        id="terms"
                        label="terms"
                        showLabel={false}>
                        By accepting the invitation, you agree to the
                        <a
                            class="link"
                            href="https://appwrite.io/policy/terms"
                            target="_blank"
                            rel="noopener noreferrer">
                            Terms and Conditions</a>
                        and
                        <a
                            class="link"
                            href="https://appwrite.io/policy/privacy"
                            target="_blank"
                            rel="noopener noreferrer">
                            Privacy and Policy</a
                        >.</InputChoice>

                    <div class="u-flex u-main-end u-gap-12">
                        <Button secondary href={`${base}/login`}
                            >{$LL.invite.button.submit.cancel()}</Button>
                        <Button submit>{$LL.invite.button.submit.accept()}</Button>
                    </div>
                </FormList>
            </Form>
        {/if}
    </svelte:fragment>
</Unauthenticated>
