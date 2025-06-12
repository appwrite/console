<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { BoxAvatar, Confirm, CardGrid } from '$lib/components';
    import { Button, InputText } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { isCloud } from '$lib/system';
    import { project, projectRegion } from '../store';
    import { organization } from '$lib/stores/organization';

    let error: string;
    let showDelete = false;
    let name: string = null;

    const handleDelete = async () => {
        try {
            // send the project to correct region pool for deletion!
            await sdk.forConsoleIn($project.region).projects.delete($project.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$project.name} has been deleted`
            });
            trackEvent(Submit.ProjectDelete);
            await goto(`${base}/organization-${$organization.$id}`, {
                replaceState: true
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectDelete);
        }
    };
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete project</svelte:fragment>
    The project will be permanently deleted, including all the metadata, resources and stats within it.
    This action is irreversible.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1" data-private>{$project.name}</h6>
            </svelte:fragment>
            {#if isCloud && $projectRegion}
                <p>Region: {$projectRegion.name}</p>
            {/if}
            <p>Last update: {toLocaleDateTime($project.$updatedAt)}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Confirm
    disabled={name !== $project.name}
    onSubmit={handleDelete}
    title="Delete project"
    bind:open={showDelete}
    bind:error>
    <p>
        <b>This project will be deleted</b>, along with all of its metadata, stats, and other
        resources. <b>This action is irreversible</b>.
    </p>
    <InputText
        label={`Enter "${$project.name}" to continue`}
        placeholder="Enter name"
        id="project-name"
        autofocus
        required
        bind:value={name} />
</Confirm>
