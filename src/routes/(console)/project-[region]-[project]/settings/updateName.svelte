<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, CopyInput } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../store';
    import { canWriteProjects } from '$lib/stores/roles';
    import { getProjectEndpoint } from '$lib/helpers/project';

    let name: string = null;

    onMount(() => {
        name = $project.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.update($project.$id, name);
            await invalidate(Dependencies.PROJECT);
            await invalidate(Dependencies.ORGANIZATION);
            addNotification({
                type: 'success',
                message: 'Project name has been updated'
            });
            trackEvent(Submit.ProjectUpdateName);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectUpdateName);
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">API credentials</svelte:fragment>
    Access Appwrite services using this project's API Endpoint and Project ID.
    <svelte:fragment slot="aside">
        <CopyInput label="Project ID" value={$project.$id} />
        <CopyInput label="API Endpoint" value={getProjectEndpoint()} />
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button
            secondary
            event="view_keys"
            href={`${base}/project-${page.params.region}-${page.params.project}/overview/keys#integrations`}>
            View API keys
        </Button>
    </svelte:fragment>
</CardGrid>
{#if $canWriteProjects}
    <Form onSubmit={updateName}>
        <CardGrid>
            <svelte:fragment slot="title">Name</svelte:fragment>
            <svelte:fragment slot="aside">
                <InputText
                    id="name"
                    label="Name"
                    bind:value={name}
                    required
                    placeholder="Enter name" />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $project.name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
{/if}
