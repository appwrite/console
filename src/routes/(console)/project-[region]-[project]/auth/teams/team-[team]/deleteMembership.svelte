<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let showDelete = false;
    export let selectedMembership: Models.Membership;

    let error: string;

    async function deleteMembership() {
        try {
            await sdk.forProject.teams.deleteMembership(
                selectedMembership.teamId,
                selectedMembership.$id
            );
            showDelete = false;
            dispatch('deleted');
            trackEvent(Submit.MemberDelete);
            await goto(
                `${base}/project-${page.params.project}/auth/teams/team-${selectedMembership.teamId}/members`
            );
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MemberDelete);
        }
    }
</script>

<Confirm onSubmit={deleteMembership} title="Delete member" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedMembership.userName}</b> from
        <b>{selectedMembership.teamName}</b>?
    </Typography.Text>
</Confirm>
