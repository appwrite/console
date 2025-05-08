<script lang="ts">
    import { base } from '$app/paths';
    import { isCloud } from '$lib/system';
    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { BoxAvatar, CardGrid, Heading, Modal } from '$lib/components';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import { project, projectRegion } from '../store';
    import { Client as TempClient, Projects as TempProjects } from '@appwrite.io/console';

    let showDelete = false;
    let name: string = null;

    /**
     * This ensures the underlying client use a region-aware endpoint
     * to correctly route project deletion requests to the appropriate regional pool.
     *
     * The console project itself isn't tied to a region, so its client doesn’t
     * include one. Without this, deletion requests would default to the manager region.
     */
    const temporaryProjects = (region: string) => {
        const tempClient = new TempClient()
            .setMode('admin')
            .setProject('console')
            .setEndpoint(getApiEndpoint(region));

        return new TempProjects(tempClient);
    };

    const handleDelete = async () => {
        try {
            await temporaryProjects($project.region).delete($project.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$project.name} has been deleted`
            });
            trackEvent(Submit.ProjectDelete);
            await goto(base);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectDelete);
        }
    };
</script>

<CardGrid danger>
    <div>
        <Heading tag="h6" size="7">Delete project</Heading>
    </div>
    <p>
        The project will be permanently deleted, including all the metadata, resources and stats
        within it. This action is irreversible.
    </p>
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

<Modal
    title="Delete project"
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p>
        <b>This project will be deleted</b>, along with all of its metadata, stats, and other
        resources. <b>This action is irreversible</b>.
    </p>

    <FormList>
        <InputText
            label={`Enter "${$project.name}" to continue`}
            placeholder="Enter name"
            id="project-name"
            autofocus
            required
            bind:value={name} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button disabled={!name || name !== $project.name} secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
