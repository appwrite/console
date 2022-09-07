<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form, FormList, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { Unauthenticated } from '$lib/layout';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    onMount(() => {
        userId = $page.url.searchParams.get('userId');
        secret = $page.url.searchParams.get('secret');
        teamId = $page.url.searchParams.get('teamId');
        membershipId = $page.url.searchParams.get('membershipId');
    });

    let teamId: string, membershipId: string, userId: string, secret: string;
    let terms = false;
    const acceptInvite = async () => {
        try {
            await sdkForConsole.teams.updateMembershipStatus(teamId, membershipId, userId, secret);
            user.fetchUser();
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            await goto(`${base}/console`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<svelte:head>
    <title>Appwrite - Accept invite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Invite</svelte:fragment>
    <svelte:fragment>
        <p class="text">You have been invited to join a team project on Appwrite</p>
        <Form on:submit={acceptInvite}>
            <FormList>
                <InputChoice required bind:value={terms} id="terms" label="terms" showLabel={false}>
                    By accepting the invitation, you agree to the <a
                        class="link"
                        href="https://appwrite.io/policy/terms"
                        target="_blank">Terms and Conditions</a>
                    and
                    <a class="link" href="https://appwrite.io/policy/privacy" target="_blank">
                        Privacy Policy</a
                    >.</InputChoice>

                <div class="u-flex u-main-end u-gap-12">
                    <Button secondary>Cancel</Button>
                    <Button submit>Accept</Button>
                </div>
            </FormList>
        </Form>
    </svelte:fragment>
</Unauthenticated>
