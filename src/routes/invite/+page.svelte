<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form, FormList, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { trackEvent } from '$lib/actions/analytics';

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
            await sdkForConsole.teams.updateMembershipStatus(teamId, membershipId, userId, secret);
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            await goto(`${base}/console/organization-${teamId}`);
            trackEvent('submit_membership_update_status');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<svelte:head>
    <title>Accept invite - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Invite</svelte:fragment>
    <svelte:fragment>
        {#if !userId || !secret || !membershipId || !teamId}
            <p class="text">Invalid invite link.</p>
        {:else}
            <p class="text">You have been invited to join a team project on Appwrite</p>
            <Form on:submit={acceptInvite}>
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
