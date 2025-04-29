<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let showDelete = false;
    export let team: Models.Team<Record<string, unknown>>;

    let error: string;

    async function deleteTeam() {
        try {
            await sdk.forProject.teams.delete(team.$id);
            showDelete = false;
            trackEvent(Submit.TeamDelete);
            await goto(`${base}/project-${page.params.project}/auth/teams`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.TeamDelete);
        }
    }
</script>

<Confirm onSubmit={deleteTeam} title="Delete team" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{team.name}</b>?
    </Typography.Text>
</Confirm>
