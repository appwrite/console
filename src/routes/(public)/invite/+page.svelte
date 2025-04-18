<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Layout, Link, Typography, Alert } from '@appwrite.io/pink-svelte';

    let teamId: string, membershipId: string, userId: string, secret: string;
    let terms = false;

    onMount(() => {
        userId = page.url.searchParams.get('userId');
        secret = page.url.searchParams.get('secret');
        teamId = page.url.searchParams.get('teamId');
        membershipId = page.url.searchParams.get('membershipId');
    });

    const acceptInvite = async () => {
        try {
            await sdk.forConsole.teams.updateMembershipStatus(teamId, membershipId, userId, secret);
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            await goto(`${base}/organization-${teamId}`);
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
            <Layout.Stack>
                <Alert.Inline status="warning" title="The invite link is not valid">
                    Please ask the project owner to send you a new invite.
                </Alert.Inline>
                <div>
                    <Button href={`${base}/register`}>Sign up to Appwrite</Button>
                </div>
            </Layout.Stack>
        {:else}
            <Layout.Stack>
                <Typography.Text>
                    You have been invited to join an organization on Appwrite
                </Typography.Text>
                <Form onSubmit={acceptInvite}>
                    <Layout.Stack>
                        <InputChoice
                            required
                            bind:value={terms}
                            id="terms"
                            label="terms"
                            showLabel={false}>
                            By accepting the invitation, you agree to the <Link.Anchor
                                href="https://appwrite.io/terms"
                                target="_blank"
                                rel="noopener noreferrer">Terms and Conditions</Link.Anchor>
                            and
                            <Link.Anchor
                                href="https://appwrite.io/privacy"
                                target="_blank"
                                rel="noopener noreferrer">
                                Privacy Policy</Link.Anchor
                            >.</InputChoice>

                        <Layout.Stack direction="row">
                            <Button secondary href={`${base}/login`}>Cancel</Button>
                            <Button submit disabled={!terms}>Accept</Button>
                        </Layout.Stack>
                    </Layout.Stack>
                </Form>
            </Layout.Stack>
        {/if}
    </svelte:fragment>
</Unauthenticated>
