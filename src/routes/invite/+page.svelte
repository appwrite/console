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
    <title>Accept invite - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">
        {#if !userId || !secret || !membershipId || !teamId}
            Invalid invite
        {:else}
            Invite
        {/if}
    </svelte:fragment>
    <svelte:fragment>
        {#if !userId || !secret || !membershipId || !teamId}
            <Alert type="warning">
                <svelte:fragment slot="title">The invite link is not valid</svelte:fragment>
                Please ask the project owner to send you a new invite.
            </Alert>
            <div class="u-flex u-main-end u-margin-block-start-40">
                <Button href={`${base}/register`}>Sign up to Appwrite</Button>
            </div>
        {:else}
            <p class="text">You have been invited to join a team project on Appwrite</p>
            <Form onSubmit={acceptInvite}>
                <FormList>
                    <InputChoice
                        required
                        bind:value={terms}
                        id="terms"
                        label="terms"
                        showLabel={false}>
                        By accepting the invitation, you agree to the <a
                            class="link"
                            href="https://appwrite.io/policy/terms"
                            target="_blank"
                            rel="noopener noreferrer">Terms and Conditions</a>
                        and
                        <a
                            class="link"
                            href="https://appwrite.io/policy/privacy"
                            target="_blank"
                            rel="noopener noreferrer">
                            Privacy Policy</a
                        >.</InputChoice>

                    <div class="u-flex u-main-end u-gap-12">
                        <Button secondary href={`${base}/login`}>Cancel</Button>
                        <Button submit>Accept</Button>
                    </div>
                </FormList>
            </Form>
        {/if}
    </svelte:fragment>
</Unauthenticated>
