<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { project } from '../../store';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let description = '';
    let id: string = null;

    const projectId = $project.$id;

    const create = async () => {
        try {
            const backup = await sdkForConsole.projects.createBackup(projectId, name);
            showCreate = false;
            dispatch('created', backup);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            trackEvent(Submit.BackupCreate, {
                customId: !!id
            });
            name = id = null;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BackupCreate);
        }
    };
</script>

<Modal size="big" on:submit={create} bind:show={showCreate}>
    <svelte:fragment slot="header">Create Backup</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="Enter Backup name"
            bind:value={name}
            autofocus
            required />

        <InputText
            id="description"
            label="Description"
            placeholder="Enter Backup Description"
            bind:value={description}
            autofocus />
    </FormList>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
