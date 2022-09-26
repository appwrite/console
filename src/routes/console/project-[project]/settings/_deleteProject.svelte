<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form, FormList, InputPassword, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../store';

    export let showDelete = false;

    const projectId = $page.params.project;
    let password: string = null;
    let name: string = null;

    onMount(async () => {
        if (projectId !== $project.$id) await project.load(projectId);
    });

    const handleDelete = async () => {
        try {
            await sdkForConsole.projects.delete($project.$id, password);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$project.name} has been deleted`
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

<Form on:submit={handleDelete}>
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">Delete Project</svelte:fragment>
        <p>
            <b>This project will be deleted</b>, along with all of its metadata, stats, and other
            resources. <b>This action is irreversible</b>.
        </p>

        <FormList>
            <InputText
                label={`Enter "${$project.name}" to continue`}
                placeholder="Enter name"
                id="name"
                autofocus
                required
                bind:value={name} />
            <InputPassword
                label="To verify, enter your password"
                placeholder="Enter password"
                id="password"
                required
                showPasswordButton={true}
                bind:value={password} />
        </FormList>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button disabled={!name || !password || name !== $project.name} secondary submit
                >Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
