<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, FormList, InputPassword, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../store';

    export let showDelete = false;

    let password: string = null;
    let name: string = null;

    const handleDelete = async () => {
        try {
            await sdk.forConsole.projects.delete($project.$id, password);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$project.name} has been deleted`
            });
            trackEvent(Submit.ProjectDelete);
            await goto(`${base}/console`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectDelete);
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={handleDelete} warning>
    <svelte:fragment slot="header">Delete Project</svelte:fragment>
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
        <Button disabled={!name || !password || name !== $project.name} secondary submit>
            Delete
        </Button>
    </svelte:fragment>
</Modal>
