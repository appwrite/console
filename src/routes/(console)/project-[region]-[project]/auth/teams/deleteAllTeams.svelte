<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDeleteAll = false;

    let error: string;

    async function deleteAllTeams() {
        try {
            const teams = await sdk
                .forProject(page.params.region, page.params.project)
                .teams.list();

            if (teams.teams.length === 0) {
                addNotification({
                    type: 'info',
                    message: 'No teams to delete'
                });
                showDeleteAll = false;
                return;
            }

            const promises = teams.teams.map((team) =>
                sdk.forProject(page.params.region, page.params.project).teams.delete(team.$id)
            );

            await Promise.all(promises);

            showDeleteAll = false;

            await invalidateAll();

            addNotification({
                type: 'success',
                message: `${teams.teams.length} team${teams.teams.length > 1 ? 's' : ''} have been deleted`
            });
            trackEvent(Submit.TeamDeleteAll);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.TeamDeleteAll);
        }
    }
</script>

<Confirm onSubmit={deleteAllTeams} title="Delete all teams" bind:open={showDeleteAll} bind:error>
    Are you sure you want to delete all teams? This action is irreversible.
</Confirm>
