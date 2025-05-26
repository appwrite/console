<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { organizationList } from '$lib/stores/organization';
    import { project } from '../store';
    import TransferProjectModal from './transferProjectModal.svelte';

    let teamId: string;
    let showTransfer = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Change organization</svelte:fragment>
    Select an organization you own to move this project.
    <svelte:fragment slot="aside">
        <InputSelect
            required
            id="organization"
            placeholder="Select destination"
            label="Move to"
            bind:value={teamId}
            options={$organizationList.teams
                .filter((team) => team.$id !== $project.teamId)
                .map((team) => ({
                    value: team.$id,
                    label: team.name
                }))} />
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            secondary
            disabled={teamId === $project.teamId}
            on:click={() => (showTransfer = true)}>Move</Button>
    </svelte:fragment>
</CardGrid>

{#if teamId}
    <TransferProjectModal
        bind:teamId
        teamName={$organizationList.teams.find((t) => t.$id == teamId).name}
        bind:show={showTransfer} />
{/if}
