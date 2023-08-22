<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, CopyInput, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../store';

    const endpoint = sdk.forConsole.client.config.endpoint;
    const projectId = $page.params.project;

    let name: string = null;

    onMount(() => {
        name = $project.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.update($project.$id, name);
            await invalidate(Dependencies.PROJECT);
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

<Form onSubmit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">API Credentials</Heading>
        <p class="text">Access Appwrite services using your API Endpoint and Project ID.</p>
        <svelte:fragment slot="aside">
            <FormList>
                <CopyInput label="Project ID" showLabel={true} value={$project.$id} />
                <CopyInput label="API Endpoint" showLabel={true} value={endpoint} />
            </FormList>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button
                secondary
                event="view_keys"
                href={`${base}/console/project-${projectId}/overview/keys#integrations`}>
                View API Keys
            </Button>
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Name</Heading>

        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="name"
                    label="Name"
                    bind:value={name}
                    required
                    placeholder="Enter name" />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={name === $project.name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
