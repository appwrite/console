<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { team } from './store';

    let teamName: string = null;

    onMount(async () => {
        teamName ??= $team.name;
    });

    async function updateName() {
        try {
            await sdk.forProject.teams.updateName(page.params.team, teamName);
            await invalidate(Dependencies.TEAM);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.TeamUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TeamUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputText
                required
                id="name"
                label="Name"
                placeholder="Enter team name"
                autocomplete={false}
                bind:value={teamName} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button submit disabled={teamName === $team.name || !teamName}>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
